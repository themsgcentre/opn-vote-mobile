import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { ElectionDetailComponent } from "../election-detail/election-detail.component";
import { CommonModule } from '@angular/common';
import { ElectionService } from 'src/app/services/election-service';
import { ElectionInformation } from 'src/app/interfaces/election';
import { IonContent } from "@ionic/angular/standalone";
import { UrlPaths } from 'src/app/globals/url';

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

  async onParticipateClicked() {
    const electionId = this.route.snapshot.paramMap.get('id');
    const voterId = Date.now(); // TODO: for simulation purposes only, replace with actual voter ID logic later

    if (!electionId) {
      console.error("Keine electionId gefunden");
      return;
    }

    try {
      const response = await fetch(`${UrlPaths.jwtUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: { electionId: electionId, voterId: voterId }, expiresIn: "" }),
      });

      if (!response.ok) {
        throw new Error("JWT konnte nicht geladen werden");
      }

      const res = await response.json();
      const JWT = res.data.token;

      this.router.navigate(['/election/register', electionId, JWT]);

    } catch (error) {
      console.error("Fehler beim Laden der JWT:", error);
    }
  }
}
