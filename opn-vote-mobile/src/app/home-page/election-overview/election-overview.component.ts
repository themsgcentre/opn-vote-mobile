import { Component, Input, OnChanges } from '@angular/core';
import { ElectionInformation } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-overview',
  templateUrl: './election-overview.component.html',
  styleUrls: ['./election-overview.component.scss'],
})
export class ElectionOverviewComponent implements OnChanges {
  @Input() election: ElectionInformation | undefined; 
  daysTilEnd: number = 0;

  ngOnChanges(): void {
  }
}
