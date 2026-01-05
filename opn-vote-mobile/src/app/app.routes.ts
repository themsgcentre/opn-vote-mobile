import { Routes } from '@angular/router';
import { ExplorePageComponent } from './explore-page/explore-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';

export const routes: Routes = [
  {
    path: 'explore',
    component: ExplorePageComponent
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
];
