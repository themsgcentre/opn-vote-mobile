import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '../../models/question';
import { ImageComponent } from "../../reusables/image/image.component";
import { defaultOptions } from '../../voting-system/default-options';
import { VoteOption } from '../../models/vote-option';
import { OptionsComponent } from '../options/options.component';

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
