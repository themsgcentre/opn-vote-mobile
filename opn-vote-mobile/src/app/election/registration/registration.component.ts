import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotService } from 'src/app/services/ballot-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { RegistrationState } from 'src/app/globals/registration.state';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionService } from 'src/app/services/election-service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent]
})
export class RegistrationComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private masterKeyService: MasterKeyService,
    private ballotService: BallotService,
    private electionService: ElectionService
  ) {}

  RegistrationState = RegistrationState;
  electionId: number = NaN;
  jwt: string | null = null;
  error: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);

  hasMasterKey$: Observable<boolean> = this.refresh$.pipe(
    switchMap(() => this.masterKeyService.hasMasterKey())
  );

  hasBallot$: Observable<boolean> = this.refresh$.pipe(
    switchMap(() => this.ballotService.hasBallot(this.electionId))
  );

  step$: Observable<RegistrationState> = combineLatest([
      this.hasMasterKey$,
      this.hasBallot$,
    ]).pipe(
      map(([hasMasterKey, hasBallot]) => {
        if (!hasMasterKey) return RegistrationState.MASTERKEY;
        if (!hasBallot) return RegistrationState.BALLOT;
        return RegistrationState.BALLOT_CREATED;
      })
    );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.electionId = idParam ? Number(idParam) : NaN;

    this.jwt = this.route.snapshot.paramMap.get('jwt');

    if (!Number.isFinite(this.electionId)) {
      this.step$ = of(RegistrationState.ERROR);
      return;
    }

    this.hasBallot$ = this.ballotService.hasBallot(this.electionId);
  }

  createBallot() {
    if (!this.jwt) {
      this.step$ = of(RegistrationState.ERROR);
      return;
    }

    forkJoin({
      n: this.electionService.getN(this.electionId),
      e: this.electionService.getE(this.electionId)
      }).pipe(
        switchMap(({ n, e }) => {
          if (!n || !e) {
            return throwError(() => new Error('ELECTION_NOT_FOUND'));
          }
          return this.ballotService.createBallot(this.electionId,this.jwt!, n, e);
        })
      ).subscribe({
        next: () => {
          this.refresh$.next();
        },

        error: (err) => {
          this.error = err?.message || 'An unknown error occurred';
          this.step$ = of(RegistrationState.ERROR);
        }
      });
  }

  createMasterKey() {
    this.masterKeyService.createNewMasterKey().subscribe({
      next: () => this.refresh$.next(),
      error: () => this.step$ = of(RegistrationState.ERROR)
    });
  }

  redirectToVoting() {
    this.router.navigate([`/election/vote/${this.electionId}`]);
  }


  //#region button listeners
  onCreateMasterKey() {
    this.createMasterKey();
  }

  onCreateBallot() {
    this.createBallot();
  }

  onProceedToVoting() {
    this.redirectToVoting();
  }

  onProceedToBallotCreation() {
    this.step$ = of(RegistrationState.BALLOT);
  }
  //#endregion
}
