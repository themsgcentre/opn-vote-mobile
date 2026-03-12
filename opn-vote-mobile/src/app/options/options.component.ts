import { Component, Input, OnInit } from '@angular/core';
import { Option } from '../interfaces/option';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  imports: [FormsModule]
})
export class OptionsComponent  implements OnInit {

  @Input() options: Option[] = [];
  @Input() groupname: string = '';
  selectedOption: Option | null = null;

  constructor() { }

  ngOnInit() {}

  onBallotSelected(option: Option) {
    this.selectedOption = option;
  }

}
