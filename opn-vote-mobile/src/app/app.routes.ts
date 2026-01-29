import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { VoteHistoryComponent } from './vote-history/vote-history.component';
import { ElectionDetailViewComponent } from './election/election-detail-view/election-detail-view.component';
import { VotingComponent } from './election/voting/voting.component';
import { MasterkeySetupComponent } from './credentials/masterkey-setup/masterkey-setup.component';
import { VoteKeySetupComponent } from './credentials/vote-key-setup/vote-key-setup.component';
import { BallotPaperSetupComponent } from './credentials/ballot-paper-setup/ballot-paper-setup.component';

export const routes: Routes = [
  {
    path: 'history',
    component: VoteHistoryComponent
  },
  {
    path: 'home',
    component: HomePageComponent
  },
  {
    path: 'user',
    component: UserPageComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'election/detail/:id', 
    component: ElectionDetailViewComponent
  },
  {
    path: 'election/credentials/master-key-setup',  
    component: MasterkeySetupComponent
  },
  {
    path: 'election/credentials/vote-key-setup/:id',
    component: VoteKeySetupComponent
  },
  {
    path: 'election/ballot-paper-setup/:id',
    component: BallotPaperSetupComponent
  },
  {
    path: 'election/vote/:id',
    component: VotingComponent
  }
];
