import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap, throwError } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotService } from 'src/app/services/ballot-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { RegistrationState } from 'src/app/globals/registration.state';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { ActivatedRoute } from '@angular/router';
import { ElectionProxyService } from 'src/app/services/election-proxy-service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent]
})
export class RegistrationComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private masterKeyService: MasterKeyService,
    private ballotService: BallotService,
    private electionProxyService: ElectionProxyService
  ) {}

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

  step$: Observable<RegistrationState> = combineLatest([
      this.hasMasterKey$,
      this.hasBallot$,
    ]).pipe(
      map(([hasMasterKey, hasBallot]) => {
        if (!hasMasterKey) return RegistrationState.MASTERKEY;
        if (!hasBallot) return RegistrationState.BALLOT;
        return RegistrationState.READY;
      })
    );;

  onCreateMasterKey() {
    this.masterKeyService.createNewMasterKey().subscribe({
      next: () => this.refresh$.next(),
      error: () => this.step$ = of(RegistrationState.ERROR)
    });
  }

  onProceedToCreateBallot() {
    this.step$ = of(RegistrationState.BALLOT);
  }


  onCreateBallot() {
    console.log(this.jwt, this.electionId);
  if (!this.jwt) {
    this.step$ = of(RegistrationState.ERROR);
    return;
  }

  this.electionProxyService.getElectionById(this.electionId).pipe(
      switchMap((election: ElectionDTO | null) => {
        if (!election) {
          return throwError(() => new Error('ELECTION_NOT_FOUND'));
        }
        return this.ballotService.createBallot(this.jwt!, election);
      })
    ).subscribe({
      next: () => {
        console.log('Ballot created successfully');
        this.refresh$.next();
      },

      error: (err) => {
        console.log(err)
        this.error = err?.message || 'An unknown error occurred';
        this.step$ = of(RegistrationState.ERROR);
      }
    });
  }

  onContinue() {
    // navigate to voting page / next screen
  }
}
