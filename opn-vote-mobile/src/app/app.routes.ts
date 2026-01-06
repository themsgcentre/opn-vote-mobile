import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { VoteHistoryComponent } from './vote-history/vote-history.component';
import { ElectionDetailViewComponent } from './election/election-detail-view/election-detail-view.component';

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
  }
];
