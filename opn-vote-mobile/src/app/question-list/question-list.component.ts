import { Component, Input, OnInit } from '@angular/core';
import { Question } from '../interfaces/question';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss'],
  imports: [QuestionComponent]
})
export class QuestionListComponent  implements OnInit {

  @Input() questions: Question[] = [];

  constructor() { }

  ngOnInit() {}

}
