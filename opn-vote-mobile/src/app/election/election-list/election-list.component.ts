import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { ElectionOverviewComponent } from '../election-overview/election-overview.component';
import { ElectionInformation } from 'src/app/models/election-information';

@Component({
  selector: 'app-election-list',
  templateUrl: './election-list.component.html',
  styleUrls: ['./election-list.component.scss'],
  imports: [ElectionOverviewComponent, TranslatePipe],
})
export class ElectionListComponent{
  @Input() elections: ElectionInformation[] = [];
  @Input() showVotingCountdown = false;
  @Output() electionClicked: EventEmitter<number> = new EventEmitter<number>();
}
