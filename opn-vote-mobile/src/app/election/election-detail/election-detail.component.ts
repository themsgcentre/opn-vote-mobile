import { Component, Input } from '@angular/core';
import { ElectionImageComponent } from 'src/app/home-page/election-image/election-image.component';
import { ElectionDTO } from 'src/app/interfaces/election-dto';

@Component({
  selector: 'app-election-detail',
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ElectionImageComponent]
})
export class ElectionDetailComponent {
  @Input() election: ElectionDTO | undefined;
}
