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
export class OptionsComponent implements OnInit {

  @Input() options: Option[] = [];
  @Input() groupname: string = '';
  @Output() selected = new EventEmitter<VoteOption>();

  selectedOption: Option | null = null;

  ngOnInit() {}

  onBallotSelected(option: Option) {
    this.selectedOption = option;
    this.selected.emit(option.voteOption);
  }

  isApprove(option: Option): boolean {
    const text = option.text.toLowerCase();
    const value = String(option.voteOption).toLowerCase();
    return text.includes('stimme zu') || value.includes('yes') || value.includes('approve');
  }

  isReject(option: Option): boolean {
    const text = option.text.toLowerCase();
    const value = String(option.voteOption).toLowerCase();
    return text.includes('stimme nicht zu') || value.includes('no') || value.includes('reject');
  }

  isAbstain(option: Option): boolean {
    const text = option.text.toLowerCase();
    const value = String(option.voteOption).toLowerCase();
    return text.includes('enthalte') || value.includes('abstain');
  }
}