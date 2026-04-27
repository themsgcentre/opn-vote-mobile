import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Option } from '../../models/option';
import { FormsModule } from '@angular/forms';
import { VoteOption } from '../../models/vote-option';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  imports: [FormsModule]
})
export class OptionsComponent implements OnInit, OnChanges {

  @Input() options: Option[] = [];
  @Input() groupname: string = '';
  @Input() initialSelection?: VoteOption;
  @Output() selected = new EventEmitter<VoteOption>();

  selectedOption: Option | null = null;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSelection'] || changes['options']) {
      this.applyInitialSelection();
    }
  }

  private applyInitialSelection(): void {
    if (this.initialSelection === undefined) {
      return;
    }
    const match = this.options.find((o) => o.voteOption === this.initialSelection);
    this.selectedOption = match ?? null;
  }

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