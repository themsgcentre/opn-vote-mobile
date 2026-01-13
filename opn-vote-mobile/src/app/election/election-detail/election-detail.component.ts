import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ElectionImageComponent } from 'src/app/home-page/election-image/election-image.component';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { daysBetween } from 'src/app/operations/date-operations';

@Component({
  selector: 'app-election-detail',
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ElectionImageComponent]
})
export class ElectionDetailComponent implements OnChanges{
  @Input() election: ElectionDTO | undefined;
  daysTilEnd: number = 0;

  ngOnChanges(): void {
    if(this.election && this.election.endDate) {
      const now = new Date();
      this.daysTilEnd = daysBetween(now, this.election.endDate)
    }
  }
}
