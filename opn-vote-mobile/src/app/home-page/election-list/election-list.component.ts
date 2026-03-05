import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ElectionOverviewComponent } from "../election-overview/election-overview.component";
import { Election } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-list',
  templateUrl: './election-list.component.html',
  styleUrls: ['./election-list.component.scss'],
  imports: [ElectionOverviewComponent],
})
export class ElectionListComponent implements OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.elections);
  }
  @Input() elections: Election[] = [];
  @Output() electionClicked: EventEmitter<number> = new EventEmitter<number>();
}
