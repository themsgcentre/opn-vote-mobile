import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { MasterKeySetupComponent } from 'src/app/credentials/master-key-setup/master-key-setup.component';
import { BallotPaperService } from 'src/app/services/ballot-paper-service';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { VoteKeyService } from 'src/app/services/vote-key-service';

type Step = 'MASTERKEY' | 'VOTEKEY' | 'BALLOT' | 'READY';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent]
})
export class RegistrationComponent implements OnInit {

  constructor(
    private masterKeyService: MasterKeyService,
    private voteKeyService: VoteKeyService,
    private ballotPaperService: BallotPaperService
  ) {}

  hasMasterKey$ = this.masterKeyService.hasMasterKey();
  hasVoteKey$ = this.voteKeyService.hasVoteKey();     
  hasBallot$ = this.ballotService.hasBallot();        

  step$: Observable<Step> = combineLatest([
    this.hasMasterKey$,
    this.hasVoteKey$,
    this.hasBallot$,
  ]).pipe(
    map(([hasMasterKey, hasVoteKey, hasBallot]) => {
      if (!hasMasterKey) return 'MASTERKEY';
      if (!hasVoteKey) return 'VOTEKEY';
      if (!hasBallot) return 'BALLOT';
      return 'READY';
    })
  );

  

  onCreateMasterKey() {
    this.masterKeyService.createNewMasterKey().subscribe();
  }

  onCreateVoteKey() {
    this.voteKeyService.createVoteKey().subscribe();
  }

  onCreateBallot() {
    this.ballotPaperService.createBallot().subscribe();
  }

  onContinue() {
    // navigate to voting page / next screen
  }
}
