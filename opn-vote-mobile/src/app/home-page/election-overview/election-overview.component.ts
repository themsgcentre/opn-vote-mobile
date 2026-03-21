import { Component, Input, OnChanges } from '@angular/core';
import { ElectionInformation } from 'src/app/interfaces/election';
import { ImageComponent } from 'src/app/home-page/image/image.component';

@Component({
  selector: 'app-election-overview',
  standalone: true,
  templateUrl: './election-overview.component.html',
  styleUrls: ['./election-overview.component.scss'],
  imports: [ImageComponent]
})
export class ElectionOverviewComponent implements OnChanges {
  @Input() election: ElectionInformation | undefined; 
  daysTilEnd: number = 0;

  ngOnChanges(): void {
  }
}
