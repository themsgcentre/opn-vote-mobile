import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElectionOverviewComponent } from "../election-overview/election-overview.component";
import { Election } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-list',
  templateUrl: './election-list.component.html',
  styleUrls: ['./election-list.component.scss'],
  imports: [ElectionOverviewComponent],
})
export class ElectionListComponent {
  @Input() elections: Election[] = [];
  @Output() electionClicked: EventEmitter<number> = new EventEmitter<number>();
}
