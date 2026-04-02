import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, switchMap, take, throwError } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotService } from 'src/app/services/ballot-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionService } from 'src/app/services/election-service';
import { VoteParticipationStorageService } from 'src/app/services/vote-participation-storage.service';

type RegistrationView =
  | 'checking'
  | 'masterkey'
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
          this.error =
            'Kein Registrierungs-Token in der URL. Bitte den Link aus der Einladung verwenden.';
          this.view = 'error';
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
            return throwError(() => new Error('ELECTION_NOT_FOUND'));
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
