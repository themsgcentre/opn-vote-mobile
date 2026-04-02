import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '../interfaces/question';
import { QuestionComponent } from '../question/question.component';
import { LineComponent } from '../reusables/line/line.component';
import { QuestionVote } from '../voting-system/vote';
import { VoteOption } from '../voting-system/vote-option';

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
