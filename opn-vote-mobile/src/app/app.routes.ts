import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { VoteHistoryComponent } from './vote-history/vote-history.component';
import { ElectionDetailViewComponent } from './election/election-detail-view/election-detail-view.component';
import { VotingComponent } from './election/voting/voting.component';
import { RegistrationComponent } from './election/registration/registration.component';
import { MasterKeySetupComponent } from './credentials/master-key-setup/master-key-setup.component';

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
    component: MasterKeySetupComponent
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
    path: 'election/register/:id/:jwt',
    component: RegistrationComponent
  },
  {
    path: 'election/vote/:id',
    component: VotingComponent
  }
];
