import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, firstValueFrom, Observable } from 'rxjs';
import { ElectionInformation } from 'src/app/interfaces/election';
import { Question } from 'src/app/interfaces/question';
import { QuestionListComponent } from 'src/app/question-list/question-list.component';
import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';
import { IonContent } from "@ionic/angular/standalone";
import { QuestionVote } from 'src/app/voting-system/vote';
import { VoteOption } from 'src/app/voting-system/vote-option';
import { VoteService } from 'src/app/services/vote-service';
import { LineComponent } from 'src/app/reusables/line/line.component';
import { VoterCredentials } from 'src/app/interfaces/voter-credentials';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
  imports: [CommonModule, QuestionListComponent, IonContent, LineComponent]
})
export class VotingComponent  implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private electionService: ElectionService,
    private voteService: VoteService,
    private ballotService: BallotService,
    private router: Router
  ) { }

  election$: Observable<ElectionInformation | null> = new Observable();
  questions$: Observable<Question[]> = new Observable();
  hasBallot$: Observable<boolean> = new Observable();
  credentials$: Observable<VoterCredentials | null> = new Observable();
  publicKey$: Observable<string | undefined> = new Observable();
  electionId: number  | null = null;

  questionCount: number = 0;
  error: string | null = null;
  canSubmit = false;
  votes: Record<number, VoteOption> = {};

  /** Set after a successful vote; drives the success dialog. */
  voteSuccessTxHash: string | null = null;

  private static readonly GNOSISSCAN_TX_BASE = 'https://gnosisscan.io/tx/';

  get gnosisscanTxUrl(): string | null {
    return this.voteSuccessTxHash
      ? `${VotingComponent.GNOSISSCAN_TX_BASE}${this.voteSuccessTxHash}`
      : null;
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const electionId = idParam ? Number(idParam) : NaN;

    if(!isNaN(electionId)) {
      this.electionId = electionId
      this.election$ = this.electionService.getElectionInformation(electionId);
      this.questions$ = this.electionService.loadQuestions(electionId);
      this.questions$.subscribe(questions => {
        this.questionCount = questions.length;
      });
      this.hasBallot$ = this.ballotService.hasBallot(electionId);
      this.publicKey$ = this.electionService.getPublicKey(electionId)
      this.credentials$ = this.ballotService.getCredentials(electionId);
    }
    else {
      this.error = "Ungültige Wahl-ID";
    }
  }

  voteUpdated(vote: QuestionVote) {
    this.votes[vote.key] = vote.selected;
    this.canSubmit = Object.keys(this.votes).length == this.questionCount;
  }

  async submitVote() {
    this.error = null;

    try {
      const [credentials, publicKey] = await firstValueFrom(
        combineLatest([this.credentials$, this.publicKey$])
      );

      if (!credentials) {
        this.error = 'Keine Voting-Credentials vorhanden';
        return;
      }

      if (!publicKey) {
        this.error = 'Kein Public Key vorhanden';
        return;
      }

      const txHash = await this.voteService.sendVotes(
        this.votes,
        credentials,
        publicKey,
        false
      );

      this.voteSuccessTxHash = txHash;
    } catch (err) {
      this.error = 'Fehler beim Senden des Votes';
    }
  }

  onVoteSuccessOkay(): void {
    this.voteSuccessTxHash = null;
    this.onVoteSuccessAcknowledged();
  }

  onVoteSuccessAcknowledged(): void {
    this.router.navigateByUrl('election/detail/' + this.electionId);
  }
}
