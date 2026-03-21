import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { ElectionListComponent } from "./election-list/election-list.component";
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElectionService } from '../services/election-service';
import { ElectionInformation } from '../interfaces/election';

type HomeTab = 'active' | 'upcoming' | 'finished';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [IonContent, ElectionListComponent, CommonModule],
})
export class HomePageComponent implements OnInit {
  openElection$: Observable<ElectionInformation[]> = of([]);

  allElections: ElectionInformation[] = [];
  filteredElections: ElectionInformation[] = [];

  selectedTab: HomeTab = 'active';
  searchTerm: string = '';

  constructor(
    private electionService: ElectionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.openElection$ = this.electionService.getAllElectionInformations();

    this.openElection$.subscribe((elections) => {
      this.allElections = elections;
      this.applyFilters();
    });
  }

  selectTab(tab: HomeTab) {
    this.selectedTab = tab;
    this.applyFilters();
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.allElections];

    result = this.filterByTab(result);
    result = this.filterBySearch(result);

    this.filteredElections = result;
  }

  filterByTab(elections: ElectionInformation[]): ElectionInformation[] {
    const now = new Date();

    switch (this.selectedTab) {
      case 'active':
        return elections.filter((election) => {
          const votingStart = new Date(election.votingStart);
          const votingEnd = new Date(election.votingEnd);
          return votingStart <= now && now <= votingEnd;
        });

      case 'upcoming':
        return elections.filter((election) => {
          const votingStart = new Date(election.votingStart);
          return now < votingStart;
        });

      case 'finished':
        return elections.filter((election) => {
          const votingEnd = new Date(election.votingEnd);
          return now > votingEnd;
        });

      default:
        return elections;
    }
  }

  filterBySearch(elections: ElectionInformation[]): ElectionInformation[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return elections;
    }

    return elections.filter((election) =>
      election.title.toLowerCase().includes(term)
    );
  }

  navigateToElection(electionId: number) {
    this.router.navigateByUrl('election/detail/' + electionId);
  }
}