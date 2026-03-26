import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, forkJoin, Observable, switchMap, throwError } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotService } from 'src/app/services/ballot-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionService } from 'src/app/services/election-service';

type RegistrationView = 'checking' | 'masterkey' | 'busy' | 'error';

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
    private electionService: ElectionService
  ) {}

  electionId: number = NaN;
  jwt: string | null = null;
  error: string | null = null;
  /** Until the first async key/ballot check completes, avoid flashing the master-key UI. */
  view: RegistrationView = 'checking';

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  private hasMasterKey$: Observable<boolean> = this.refresh$.pipe(
    switchMap(() => this.masterKeyService.hasMasterKey())
  );

  private hasBallot$: Observable<boolean> = this.refresh$.pipe(
    switchMap(() => this.ballotService.hasBallot(this.electionId))
  );

  /** Prevents duplicate auto ballot requests while one is in flight or after a hard failure. */
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

    combineLatest([this.hasMasterKey$, this.hasBallot$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([hasMasterKey, hasBallot]) => {
        if (!hasMasterKey) {
          this.view = 'masterkey';
          this.autoBallotRequestStarted = false;
          return;
        }

        if (hasBallot) {
          this.redirectToVoting();
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
        })
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
    void this.router.navigate([`/election/vote/${this.electionId}`]);
  }
}
