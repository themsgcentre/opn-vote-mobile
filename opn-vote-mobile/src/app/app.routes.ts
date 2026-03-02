import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { VoteHistoryComponent } from './vote-history/vote-history.component';
import { ElectionDetailViewComponent } from './election/election-detail-view/election-detail-view.component';
import { VotingComponent } from './election/voting/voting.component';
import { MasterKeyManagementComponent } from './credentials/master-key-management/master-key-management.component';
import { RegistrationComponent } from './election/registration/registration.component';

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
    component: MasterKeyManagementComponent
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
    path: 'election/vote/:id/',
    component: VotingComponent
  }
];
