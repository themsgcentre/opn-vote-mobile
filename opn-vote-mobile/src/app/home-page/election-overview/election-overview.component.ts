import { Component, Input, OnChanges } from '@angular/core';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { ElectionInfoComponent } from "../election-info/election-info.component";
import { ElectionImageComponent } from "../election-image/election-image.component";
import { daysBetween } from 'src/app/operations/date-operations';

@Component({
  selector: 'app-election-overview',
  templateUrl: './election-overview.component.html',
  styleUrls: ['./election-overview.component.scss'],
  imports: [ElectionInfoComponent, ElectionImageComponent],
})
export class ElectionOverviewComponent implements OnChanges {
  @Input() election: ElectionDTO | undefined; 
  daysTilEnd: number = 0;

  ngOnChanges(): void {
    const now = new Date();
    /*if(this.election && this.election.endDate) {
      this.daysTilEnd = daysBetween(now, this.election.endDate)
    }*/
  }
}
