import { Component, Input } from '@angular/core';
import { ElectionInformation } from 'src/app/models/election-information';
import { ImageComponent } from 'src/app/home-page/image/image.component';
import { VotingCountdownComponent } from '../voting-countdown/voting-countdown.component';

@Component({
  selector: 'app-election-overview',
  standalone: true,
  templateUrl: './election-overview.component.html',
  styleUrls: ['./election-overview.component.scss'],
  imports: [ImageComponent, VotingCountdownComponent],
})
export class ElectionOverviewComponent {
  @Input() election: ElectionInformation | undefined;
  @Input() showVotingCountdown = false;
}
