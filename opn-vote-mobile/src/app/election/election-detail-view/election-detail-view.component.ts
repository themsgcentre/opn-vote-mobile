import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { ElectionService } from 'src/app/services/election-service';
import { ElectionDetailComponent } from "../election-detail/election-detail.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-election-detail-view',
  templateUrl: './election-detail-view.component.html',
  styleUrls: ['./election-detail-view.component.scss'],
  imports: [ElectionDetailComponent, CommonModule],
})
export class ElectionDetailViewComponent  implements OnInit {
  election$: Observable<ElectionDTO | undefined> = of(undefined)
  constructor(
    private route: ActivatedRoute,
    private electionService: ElectionService
  ) { }

  ngOnInit() {
    this.election$ = this.route.paramMap.pipe(
      map(paramMap => Number(paramMap.get('id'))),
      filter(id => !isNaN(id)),
      switchMap(id =>
        this.electionService.getElectionById(id)
      )
    );
  }
}
