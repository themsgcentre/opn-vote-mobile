import { Component, Input } from '@angular/core';
import { ElectionDTO } from 'src/app/interfaces/election-dto';

@Component({
  selector: 'app-election-detail',
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
})
export class ElectionDetailComponent {
  @Input() election: ElectionDTO | undefined;
}
