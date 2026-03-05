import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { combineLatest, map, Observable, of } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotService } from 'src/app/services/ballot-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { RegistrationState } from 'src/app/globals/registration.state';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent]
})
export class RegistrationComponent {
  RegistrationState = RegistrationState; 

  constructor(
    private masterKeyService: MasterKeyService,
    private ballotService: BallotService
  ) {}

  hasMasterKey$ = this.masterKeyService.hasMasterKey();
  hasBallot$ =  of(false);     

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
      next: () => this.hasMasterKey$ = this.masterKeyService.hasMasterKey(),
      error: () => this.step$ = of(RegistrationState.ERROR)
    });
  }

  onCreateVoteKey() {
    //this.voteKeyService.createVoteKey().subscribe();
  }

  onCreateBallot() {
    //this.ballotPaperService.createBallot().subscribe();
  }

  onContinue() {
    // navigate to voting page / next screen
  }
}
