import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ElectionOverviewComponent } from "../election-overview/election-overview.component";
import { ElectionInformation } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-list',
  templateUrl: './election-list.component.html',
  styleUrls: ['./election-list.component.scss'],
  imports: [ElectionOverviewComponent],
})
export class ElectionListComponent{
  @Input() elections: ElectionInformation[] = [];
  @Output() electionClicked: EventEmitter<number> = new EventEmitter<number>();
}
