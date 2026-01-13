import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NumberDisplayComponent } from "../number-display/number-display.component";
import { VerticalLineComponent } from "src/app/reusables/vertical-line/vertical-line.component";

@Component({
  selector: 'app-election-info',
  templateUrl: './election-info.component.html',
  styleUrls: ['./election-info.component.scss'],
  imports: [NumberDisplayComponent, VerticalLineComponent],
})
export class ElectionInfoComponent {
  @Input() category: string = '';
  @Input() title: string = '';
  @Input() numberOfVotes: number = 0;
  @Input() daysTilEnd = 0;
}
