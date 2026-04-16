import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, switchMap, take, throwError } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotService } from 'src/app/services/ballot-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionService } from 'src/app/services/election-service';
import { VoteParticipationStorageService } from 'src/app/services/vote-participation-storage.service';
import { ApJwtService } from 'src/app/services/ap-jwt.service';

const AP_AUTH_COUNTDOWN_SECONDS = 3;
const AP_AUTH_SUCCESS_DISPLAY_MS = 1500;

type RegistrationView =
  | 'checking'
  | 'masterkey'
  | 'authorizing'
  | 'busy'
  | 'error'
  | 'registrationClosed';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [MasterKeySetupComponent],
})
export class RegistrationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private masterKeyService: MasterKeyService,
    private ballotService: BallotService,
    private electionService: ElectionService,
    private voteParticipationStorage: VoteParticipationStorageService,
    private apJwtService: ApJwtService,
  ) {}

  electionId: number = NaN;
  jwt: string | null = null;
  error: string | null = null;

  view: RegistrationView = 'checking';

  private registrationEnded = false;

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  private hasMasterKey$: Observable<boolean> = this.refresh$.pipe(
    switchMap(() => this.masterKeyService.hasMasterKey()),
  );

  private hasBallot$: Observable<boolean> = this.refresh$.pipe(
    switchMap(() => this.ballotService.hasBallot(this.electionId)),
  );

  private autoBallotRequestStarted = false;

  private apAuthInFlight = false;

  apAuthOverlayText = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.electionId = idParam ? Number(idParam) : NaN;
    this.jwt = this.route.snapshot.paramMap.get('jwt');

    if (!Number.isFinite(this.electionId)) {
      this.error = 'Ungültige Wahl-ID';
      this.view = 'error';
      return;
    }

    this.electionService
      .getElectionInformation(this.electionId)
      .pipe(
        take(1),
        switchMap((election) => {
          if (!election) {
            this.error = 'Wahl nicht gefunden';
            this.view = 'error';
            return EMPTY;
          }
          this.registrationEnded = Date.now() > election.registrationEnd.getTime();
          return combineLatest([this.hasMasterKey$, this.hasBallot$]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([hasMasterKey, hasBallot]) => {
        if (hasBallot) {
          this.redirectToVoting();
          return;
        }

        //#region limit registration if registration period has ended
        if (this.registrationEnded) {
          this.error =
            'Die Registrierungsfrist ist abgelaufen. Ohne einen auf diesem Gerät bereits erstellten Wahlschein ist eine Registrierung nicht mehr möglich.';
          this.view = 'registrationClosed';
          this.autoBallotRequestStarted = false;
          return;
        }
        //#endregion

        if (!hasMasterKey) {
          this.view = 'masterkey';
          this.autoBallotRequestStarted = false;
          return;
        }

        if (!this.jwt) {
          if (this.apAuthInFlight) {
            return;
          }
          this.apAuthInFlight = true;
          this.error = null;
          this.view = 'authorizing';
          void this.obtainJwtWithDemoUx()
            .then((token) => {
              this.jwt = token;
              this.apAuthInFlight = false;
              this.refresh$.next();
            })
            .catch(() => {
              this.apAuthInFlight = false;
              this.error =
                'Autorisierung beim Authorization Provider ist fehlgeschlagen. Bitte erneut versuchen.';
              this.view = 'error';
            });
          return;
        }

        if (this.autoBallotRequestStarted) {
          return;
        }

        this.autoBallotRequestStarted = true;
        this.view = 'busy';
        this.error = null;
        this.runAutoBallotCreation();
      });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async obtainJwtWithDemoUx(): Promise<string> {
    const apName = this.apJwtService.getProviderDisplayName(this.electionId);
    for (let s = AP_AUTH_COUNTDOWN_SECONDS; s >= 1; s--) {
      this.apAuthOverlayText = `Weiterleitung zu ${apName} in ${s} Sekunden …`;
      await this.sleep(1000);
    }
    this.apAuthOverlayText = `Autorisierung bei ${apName} …`;
    const voterId = Date.now();
    const { token } = await this.apJwtService.fetchJwtForElection(this.electionId, voterId);
    this.apAuthOverlayText = 'Erfolgreich autorisiert';
    await this.sleep(AP_AUTH_SUCCESS_DISPLAY_MS);
    this.apAuthOverlayText = '';
    return token;
  }

  goHome(): void {
    void this.router.navigateByUrl('/home');
  }

  private runAutoBallotCreation(): void {
    forkJoin({
      n: this.electionService.getN(this.electionId),
      e: this.electionService.getE(this.electionId),
    })
      .pipe(
        switchMap(({ n, e }) => {
          if (!n || !e) {
            return throwError(() => new Error('Election Daten unvollständig'));
          }
          return this.ballotService.createBallot(this.electionId, this.jwt!, n, e);
        }),
      )
      .subscribe({
        next: () => this.refresh$.next(),
        error: (err: { message?: string }) => {
          this.error = err?.message || 'Wahlschein konnte nicht erstellt werden.';
          this.view = 'error';
        },
      });
  }

  onCreateMasterKey(): void {
    this.masterKeyService.createNewMasterKey().subscribe({
      next: () => this.refresh$.next(),
      error: () => {
        this.error = 'Master-Key konnte nicht erstellt werden.';
        this.view = 'error';
      },
    });
  }

  private redirectToVoting(): void {
    void this.voteParticipationStorage.recordRegistered(this.electionId);
    void this.router.navigate([`/election/vote/${this.electionId}`]);
  }
}
