import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss'],
})
export class LineComponent {
  @Input() height: string = "0px";
  @Input() width: string = "0px";
  @Input() color: string = 'white';
  @Input() margin: string = '0px';
}
