import { Routes } from '@angular/router';
import { ExplorePageComponent } from './explore-page/explore-page.component';

export const routes: Routes = [
  {
    path: 'explore',
    component: ExplorePageComponent
  },
  {
    path: '',
    redirectTo: 'explore',
    pathMatch: 'full',
  },
];
