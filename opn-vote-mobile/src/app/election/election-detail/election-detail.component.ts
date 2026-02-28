import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ElectionImageComponent } from 'src/app/home-page/election-image/election-image.component';
import { ElectionDTO } from 'src/app/interfaces/election-dto';

@Component({
  selector: 'app-election-detail',
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ElectionImageComponent]
})
export class ElectionDetailComponent implements OnChanges{
  @Input() election: ElectionDTO | null = null;
  @Output() participateClicked: EventEmitter<void> = new EventEmitter<void>();
  daysTilEnd: number = 0;

  ngOnChanges(): void {
    console.log(this.election);
  }
}
