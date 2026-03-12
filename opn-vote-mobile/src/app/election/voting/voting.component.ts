import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ElectionInformation } from 'src/app/interfaces/election';
import { Question } from 'src/app/interfaces/question';
import { QuestionListComponent } from 'src/app/question-list/question-list.component';
import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';
import { IonContent } from "@ionic/angular/standalone";
import { QuestionVote } from 'src/app/voting-system/vote';
import { VoteOption } from 'src/app/voting-system/vote-option';
import { VoteService } from 'src/app/services/vote-service';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
  imports: [CommonModule, QuestionListComponent, IonContent]
})
export class VotingComponent  implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private electionService: ElectionService,
    private voteService: VoteService,
    private ballotService: BallotService,
  ) { }

  election$: Observable<ElectionInformation | null> = new Observable();
  questions$: Observable<Question[]> = new Observable();
  questionCount: number = 0;
  error: string | null = null;
  canSubmit = false;
  votes: Record<number, VoteOption> = {};

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const electionId = idParam ? Number(idParam) : NaN;

    if(!isNaN(electionId)) {
      this.election$ = this.electionService.getElectionInformation(electionId);
      this.questions$ = this.electionService.loadQuestions(electionId);
      this.questions$.subscribe(questions => {
        this.questionCount = questions.length;
      });
    }
    else {
      this.error = "Ungültige Wahl-ID";
    }
  }

  voteUpdated(vote: QuestionVote) {
    this.votes[vote.key] = vote.selected;
    this.canSubmit = Object.keys(this.votes).length == this.questionCount;
  }

  submitVote() {
    
  }

}
