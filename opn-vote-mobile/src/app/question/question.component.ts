import { Component, Input, OnInit } from '@angular/core';
import { Question } from '../interfaces/question';
import { ImageComponent } from "../home-page/election-image/election-image.component";
import { OptionsComponent } from "../options/options.component";

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  imports: [ImageComponent, OptionsComponent],
})
export class QuestionComponent  implements OnInit {
  @Input() question: Question | null = null;

  constructor() { }

  ngOnInit() {}

}
