import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-number-display',
  templateUrl: './number-display.component.html',
  styleUrls: ['./number-display.component.scss'],
})
export class NumberDisplayComponent {
  @Input() numericValue: number = 0;
  @Input() description: string = '';
}