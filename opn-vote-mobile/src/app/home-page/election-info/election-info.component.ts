import { Component, Input } from '@angular/core';
import { LineComponent } from "src/app/reusables/line/line.component";
import { NumberDisplayComponent } from 'src/app/reusables/number-display/number-display.component';

@Component({
  selector: 'app-election-info',
  templateUrl: './election-info.component.html',
  styleUrls: ['./election-info.component.scss'],
  imports: [NumberDisplayComponent, LineComponent],
})
export class ElectionInfoComponent {
  @Input() category: string = '';
  @Input() title: string = '';
  @Input() numberOfVotes: number = 0;
  @Input() daysTilEnd = 0;
}
