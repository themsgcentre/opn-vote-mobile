import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { ElectionListComponent } from "./election-list/election-list.component";
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElectionService } from '../services/election-service';
import { Election } from '../interfaces/election';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [IonContent, ElectionListComponent, CommonModule],
})
export class HomePageComponent  implements OnInit {

  openElection$: Observable<Election[]> = of([]);
  constructor(
    private electionService: ElectionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.openElection$ = this.electionService.getAllElections();
  }

  navigateToElection(electionId: number) {
    this.router.navigateByUrl('election/detail/' + electionId)
  }
}
