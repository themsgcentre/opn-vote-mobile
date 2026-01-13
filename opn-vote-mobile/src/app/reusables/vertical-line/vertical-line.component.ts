import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-vertical-line',
  templateUrl: './vertical-line.component.html',
  styleUrls: ['./vertical-line.component.scss'],
})
export class VerticalLineComponent {
  @Input() height: number = 0;
  @Input() color: string = 'white';
}
