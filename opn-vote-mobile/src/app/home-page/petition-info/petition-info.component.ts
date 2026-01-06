import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NumberDisplayComponent } from "../number-display/number-display.component";
import { VerticalLineComponent } from "src/app/reusables/vertical-line/vertical-line.component";

@Component({
  selector: 'app-petition-info',
  templateUrl: './petition-info.component.html',
  styleUrls: ['./petition-info.component.scss'],
  imports: [NumberDisplayComponent, VerticalLineComponent],
})
export class PetitionInfoComponent {
  @Input() category: string = '';
  @Input() title: string = '';
  @Input() numberOfVotes: number = 0;
  @Input() daysTilEnd = 0;
}
