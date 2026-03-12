import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '../interfaces/question';
import { QuestionComponent } from '../question/question.component';
import { LineComponent } from '../reusables/line/line.component';
import { Vote } from '../voting-system/vote';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss'],
  imports: [QuestionComponent, LineComponent]
})
export class QuestionListComponent  implements OnInit {

  @Input() questions: Question[] = [];
  @Output() optionSelected = new EventEmitter<Vote>();

  constructor() { }

  ngOnInit() {}

}
