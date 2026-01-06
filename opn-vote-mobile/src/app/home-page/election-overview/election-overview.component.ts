import { Component, Input, OnChanges } from '@angular/core';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { ElectionInfoComponent } from "../election-info/election-info.component";
import { ElectionImageComponent } from "../election-image/election-image.component";

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
    if(this.election && this.election.endDate) {
      this.daysTilEnd = this.daysBetween(now, this.election.endDate)
    }
  }

  private daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = date2.getTime() - date1.getTime();
    return Math.floor(diffMs / msPerDay);
  }
}
