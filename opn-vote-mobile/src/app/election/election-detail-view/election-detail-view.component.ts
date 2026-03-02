import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { ElectionDetailComponent } from "../election-detail/election-detail.component";
import { CommonModule } from '@angular/common';
import { ElectionService } from 'src/app/services/election-service';
import { Election } from 'src/app/interfaces/election';
import { IonCol, IonContent } from "@ionic/angular/standalone";
import { JWT } from 'src/app/jwt';

@Component({
  selector: 'app-election-detail-view',
  templateUrl: './election-detail-view.component.html',
  styleUrls: ['./election-detail-view.component.scss'],
  imports: [ElectionDetailComponent, CommonModule, IonContent],
})
export class ElectionDetailViewComponent  implements OnInit {
  election$: Observable<Election | null> = of(null)
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
        this.electionService.getElectionById(id)
      )
    );
  }

  onParticipateClicked() {
    const electionId = this.route.snapshot.paramMap.get('id');
    this.router.navigate( ['/election/register', electionId, JWT]);
  }
}
