import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Option } from '../interfaces/option';
import { FormsModule } from '@angular/forms';
import { VoteOption } from '../voting-system/vote-option';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  imports: [FormsModule]
})
export class OptionsComponent  implements OnInit {

  @Input() options: Option[] = [];
  @Input() groupname: string = '';
  @Output() selected = new EventEmitter<VoteOption>();
  selectedOption: Option | null = null;

  constructor() { }

  ngOnInit() {}

  onBallotSelected(option: Option) {
    this.selectedOption = option;
    this.selected.emit(this.selectedOption.voteOption);
  }

}
