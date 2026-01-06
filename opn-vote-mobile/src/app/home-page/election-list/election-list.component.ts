import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { ElectionOverviewComponent } from "../election-overview/election-overview.component";

@Component({
  selector: 'app-election-list',
  templateUrl: './election-list.component.html',
  styleUrls: ['./election-list.component.scss'],
  imports: [ElectionOverviewComponent],
})
export class ElectionListComponent {
  @Input() elections: ElectionDTO[] = [];
  @Output() electionClicked: EventEmitter<number> = new EventEmitter<number>();
}
