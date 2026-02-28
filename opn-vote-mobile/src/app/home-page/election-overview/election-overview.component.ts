import { Component, Input, OnChanges } from '@angular/core';
import { ElectionInfoComponent } from "../election-info/election-info.component";
import { ElectionImageComponent } from "../election-image/election-image.component";
import { Election } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-overview',
  templateUrl: './election-overview.component.html',
  styleUrls: ['./election-overview.component.scss'],
  imports: [ElectionInfoComponent, ElectionImageComponent],
})
export class ElectionOverviewComponent implements OnChanges {
  @Input() election: Election | undefined; 
  daysTilEnd: number = 0;

  ngOnChanges(): void {
  }
}
