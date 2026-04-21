import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '../models/question';
import { ImageComponent } from "../home-page/image/image.component";
import { OptionsComponent } from "../options/options.component";
import { defaultOptions } from '../voting-system/default-options';
import { VoteOption } from '../voting-system/vote-option';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  imports: [ImageComponent, OptionsComponent],
})
export class QuestionComponent  implements OnInit {

  @Output() optionSelected = new EventEmitter<VoteOption>();
  @Input() question: Question | null = null;
  @Input() initialVote?: VoteOption;
  options = defaultOptions;

  constructor() { }

  ngOnInit() {}

}
