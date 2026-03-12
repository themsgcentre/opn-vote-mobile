import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ImageComponent } from 'src/app/home-page/image/image.component';
import { ElectionInformation } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-detail',
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ImageComponent]
})
export class ElectionDetailComponent implements OnChanges{
  @Input() election: ElectionInformation | null = null;
  @Output() participateClicked: EventEmitter<void> = new EventEmitter<void>();

  ngOnChanges(): void {
    console.log(this.election);
  }
}
