import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ImageComponent } from 'src/app/home-page/image/image.component';
import { ElectionInformation } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-detail',
  standalone: true,
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ImageComponent]
})
export class ElectionDetailComponent implements OnChanges {
  ngOnChanges(): void {
    if(this.election) {
      this.hasStarted = this.isInPast(this.election.registrationStart)
      this.hasEnded = this.isInPast(this.election.registrationEnd)
    }
  }
  hasStarted = false;
  hasEnded = false;
  @Input() election: ElectionInformation | null = null;
  @Output() participateClicked: EventEmitter<void> = new EventEmitter<void>();

  private isInPast(date: Date) {
    const now = Date.now();
    return now - date.getTime() > 0;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  }
}
