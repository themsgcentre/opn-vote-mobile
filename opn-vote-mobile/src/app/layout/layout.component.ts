import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { NavigationBarComponent } from "../navigation/navigation-bar/navigation-bar.component";
import { TopBarComponent } from "../top-bar/top-bar.component";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [IonRouterOutlet, NavigationBarComponent, TopBarComponent]
})
export class LayoutComponent  implements OnInit {
  constructor() { }
  ngOnInit() {}
}
