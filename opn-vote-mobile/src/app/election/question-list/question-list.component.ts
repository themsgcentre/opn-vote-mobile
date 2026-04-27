import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { LineComponent } from 'src/app/reusables/line/line.component';
import { VoteOption } from 'src/app/voting-system/vote-option';
import { Question } from 'src/app/models/question';
import { QuestionVote } from 'src/app/voting-system/vote';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss'],
  imports: [QuestionComponent, LineComponent]
})
export class QuestionListComponent  implements OnInit {

  @Input() questions: Question[] = [];
  @Input() initialVotes: Record<number, VoteOption> = {};
  @Output() optionSelected = new EventEmitter<QuestionVote>();

  constructor() { }

  ngOnInit() {}

}
