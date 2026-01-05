import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [IonContent],
})
export class HomePageComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
