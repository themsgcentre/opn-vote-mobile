import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { ElectionListComponent } from "./election-list/election-list.component";
import { ElectionService } from '../services/election-service';
import { ElectionDTO } from '../interfaces/election-dto';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [IonContent, ElectionListComponent, CommonModule],
})
export class HomePageComponent  implements OnInit {

  openElection$: Observable<ElectionDTO[]> = of([]);
  constructor(
    private electionSerivce: ElectionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.openElection$ = this.electionSerivce.getOpenElections();
  }

  navigateToElection(electionId: number) {
    this.router.navigateByUrl('election/detail/' + electionId)
  }
}
