import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { ElectionDetailComponent } from "../election-detail/election-detail.component";
import { CommonModule } from '@angular/common';
import { ElectionService } from 'src/app/services/election-service';
import { ElectionInformation } from 'src/app/interfaces/election';
import { IonContent } from "@ionic/angular/standalone";
import { createJwt, createPayload } from 'src/app/jwt';

@Component({
  selector: 'app-election-detail-view',
  templateUrl: './election-detail-view.component.html',
  styleUrls: ['./election-detail-view.component.scss'],
  imports: [ElectionDetailComponent, CommonModule, IonContent],
})
export class ElectionDetailViewComponent  implements OnInit {
  election$: Observable<ElectionInformation | null> = of(null)
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private electionService: ElectionService
  ) { }

  ngOnInit() {
    this.election$ = this.route.paramMap.pipe(
      map(paramMap => Number(paramMap.get('id'))),
      filter(id => !isNaN(id)),
      switchMap(id =>
        this.electionService.getElectionInformation(id)
      )
    );
  }

  onParticipateClicked() {
    const electionId = this.route.snapshot.paramMap.get('id');
    const JWT = ''
    this.router.navigate( ['/election/register', electionId, JWT]);
  }
}
