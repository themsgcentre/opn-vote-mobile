import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, AlertController } from "@ionic/angular/standalone";
import { ElectionListComponent } from "./election-list/election-list.component";
import { interval, Observable, of, firstValueFrom, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElectionService } from '../services/election-service';
import { ElectionInformation } from '../interfaces/election';
import { BallotService } from '../services/ballot-service';
import { VotingStartDialogService } from '../services/voting-start-dialog-service';

type HomeTab = 'upcoming' | 'pending' | 'running' | 'finished';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [IonContent, ElectionListComponent, CommonModule],
})
export class HomePageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  openElection$: Observable<ElectionInformation[]> = of([]);

  allElections: ElectionInformation[] = [];
  filteredElections: ElectionInformation[] = [];

  selectedTab: HomeTab = 'upcoming';
  searchTerm: string = '';

  private votingStartPromptBusy = false;

  constructor(
    private electionService: ElectionService,
    private ballotService: BallotService,
    private votingStartDialogService: VotingStartDialogService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.openElection$ = this.electionService.getAllElectionInformations();

    this.openElection$.subscribe((elections) => {
      this.allElections = elections;
      this.applyFilters();
      void this.tryShowVotingStartPrompt(elections);
    });

    interval(15_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.tryShowVotingStartPrompt(this.allElections);
      });
  }

  private async tryShowVotingStartPrompt(elections: ElectionInformation[]): Promise<void> {
    if (this.votingStartPromptBusy || elections.length === 0) {
      return;
    }
    const now = Date.now();
    const inVotingWindow = elections.filter(
      (e) => e.votingStart.getTime() <= now && now <= e.votingEnd.getTime(),
    );

    for (const election of inVotingWindow) {
      const alreadyShown = await this.votingStartDialogService.hasShownPrompt(election.id);
      if (alreadyShown) {
        continue;
      }
      const hasBallot = await firstValueFrom(this.ballotService.hasBallot(election.id).pipe(take(1)));
      if (!hasBallot) {
        continue;
      }

      this.votingStartPromptBusy = true;
      const alert = await this.alertController.create({
        header: 'Abstimmung möglich',
        message: `Die Abstimmung „${election.title}“ hat begonnen. Sie können jetzt abstimmen.`,
        buttons: [
          {
            text: 'Später',
            role: 'cancel',
          },
          {
            text: 'Jetzt abstimmen',
            handler: () => {
              void this.router.navigateByUrl(`election/vote/${election.id}`);
            },
          },
        ],
      });

      try {
        await alert.present();
        await alert.onDidDismiss();
        await this.votingStartDialogService.markPromptShown(election.id);
      } finally {
        this.votingStartPromptBusy = false;
      }
      return;
    }
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
      case 'upcoming':
        return elections.filter((election) => {
          const registrationStart = new Date(election.registrationStart);
          const registrationEnd = new Date(election.registrationEnd);
          const votingStart = new Date(election.votingStart);
          return registrationStart <= now && now <= registrationEnd && now < votingStart;
        });

      case 'running':
        return elections.filter((election) => {
          const votingStart = new Date(election.votingStart);
          const votingEnd = new Date(election.votingEnd);
          return votingStart <= now && now <= votingEnd;
        });

      case 'pending':
        return elections.filter((election) => {
          const registrationEnd = new Date(election.registrationEnd);
          const votingStart = new Date(election.votingStart);
          return registrationEnd < now && now < votingStart;
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
