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
import { Vote } from 'src/app/voting-system/vote';
import { VoteOption } from 'src/app/voting-system/vote-option';

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
    private ballotService: BallotService,
  ) { }

  election$: Observable<ElectionInformation | null> = new Observable();
  questions$: Observable<Question[]> = new Observable();
  error: string | null = null;
  votes: Record<string, VoteOption> = {};

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const electionId = idParam ? Number(idParam) : NaN;
    console.log("VotingComponent initialized with electionId", electionId);

    if(!isNaN(electionId)) {
      console.log("Loading election with id", electionId);
      this.election$ = this.electionService.getElectionInformation(electionId);
      this.questions$ = this.electionService.loadQuestions(electionId);
    }
    else {
      this.error = "Ungültige Wahl-ID";
    }
  }

  voteUpdated(vote: Vote) {
    this.votes[vote.key] = vote.selected;
  }

}
