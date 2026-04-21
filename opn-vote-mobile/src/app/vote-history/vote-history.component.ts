import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { ElectionListComponent } from '../home-page/election-list/election-list.component';
import { ElectionService } from '../services/election-service';
import { VoteParticipationStorageService } from '../services/vote-participation-storage.service';
import { ElectionInformation } from '../models/election-information';
import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-vote-history',
  templateUrl: './vote-history.component.html',
  styleUrls: ['./vote-history.component.scss'],
  imports: [IonContent, ElectionListComponent, TranslatePipe],
})
export class VoteHistoryComponent implements ViewWillEnter {
  private readonly electionService = inject(ElectionService);
  private readonly participationStorage = inject(VoteParticipationStorageService);
  private readonly router = inject(Router);

  registeredElections: ElectionInformation[] = [];
  votedElections: ElectionInformation[] = [];

  ionViewWillEnter(): void {
    void this.loadLists();
  }

  navigateToElection(electionId: number): void {
    void this.router.navigateByUrl(`election/detail/${electionId}`);
  }

  private async loadLists(): Promise<void> {
    const [registeredIds, votedIds, all] = await Promise.all([
      this.participationStorage.getRegisteredIds(),
      this.participationStorage.getVotedIds(),
      firstValueFrom(this.electionService.getAllElectionInformations()),
    ]);

    const registeredSet = new Set(registeredIds);
    const votedSet = new Set(votedIds);

    this.registeredElections = all.filter(
      (e) => registeredSet.has(e.id) && !votedSet.has(e.id),
    );
    this.votedElections = all.filter((e) => votedSet.has(e.id));
  }
}
