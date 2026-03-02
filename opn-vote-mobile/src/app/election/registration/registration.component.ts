import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { combineLatest, map, Observable, of } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotPaperService } from 'src/app/services/ballot-paper-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { VoteKeyService } from 'src/app/services/vote-key-service';
import { RegistrationState } from 'src/app/globals/registration.state';
import { VoteKeySetupComponent } from "src/app/credentials/vote-key-setup/vote-key-setup.component";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent, VoteKeySetupComponent]
})
export class RegistrationComponent {
  RegistrationState = RegistrationState; 

  constructor(
    private masterKeyService: MasterKeyService,
    private voteKeyService: VoteKeyService,
    private ballotPaperService: BallotPaperService
  ) {}

  hasMasterKey$ = this.masterKeyService.hasMasterKey();
  hasVoteKey$ = of(false); 
  hasBallot$ =  of(false);     

  step$: Observable<RegistrationState> = combineLatest([
      this.hasMasterKey$,
      this.hasVoteKey$,
      this.hasBallot$,
    ]).pipe(
      map(([hasMasterKey, hasVoteKey, hasBallot]) => {
        if (!hasMasterKey) return RegistrationState.MASTERKEY;
        if (!hasVoteKey) return RegistrationState.VOTEKEY;
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
