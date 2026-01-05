import { Component, OnInit } from '@angular/core';
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

  selectedPath: string = "home";

  selectPath(path: string) {
    this.selectedPath = path;
    this.router.navigateByUrl(path);
  }
}
