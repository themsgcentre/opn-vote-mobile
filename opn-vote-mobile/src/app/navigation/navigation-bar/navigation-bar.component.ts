import { Component } from '@angular/core';
import { NavigationButtonComponent } from "../navigation-button/navigation-button.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
  imports: [NavigationButtonComponent],
})
export class NavigationBarComponent {

  constructor(private router: Router) {}

  selectPath(path: string) {
    void this.router.navigateByUrl(`/${path}`);
  }

  isRouteActive(path: string): boolean {
    return this.router.isActive(`/${path}`, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
