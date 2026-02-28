import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { ElectionDTO } from 'src/app/interfaces/election-dto';
import { ElectionProxyService } from 'src/app/services/election-proxy-service';
import { ElectionDetailComponent } from "../election-detail/election-detail.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-election-detail-view',
  templateUrl: './election-detail-view.component.html',
  styleUrls: ['./election-detail-view.component.scss'],
  imports: [ElectionDetailComponent, CommonModule],
})
export class ElectionDetailViewComponent  implements OnInit {
  election$: Observable<ElectionDTO | null> = of(null)
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private electionService: ElectionProxyService
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

  onParticipateClicked() {
    const electionId = this.route.snapshot.paramMap.get('id');
    this.router.navigate( ['/election/credentials/master-key-setup'],
      { queryParams: { canSkip: false, electionId: electionId, returnUrl: `election/credentials/vote-key-setup/${electionId}`} });
  }
}
