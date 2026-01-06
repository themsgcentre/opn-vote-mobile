import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { PetitionListComponent } from "./petition-list/petition-list.component";
import { PetitionService } from '../services/petition-service';
import { PetitionDTO } from '../interfaces/petition-dto';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [IonContent, PetitionListComponent, CommonModule],
})
export class HomePageComponent  implements OnInit {

  openPetitions$: Observable<PetitionDTO[]> = of([]);
  constructor(
    private petitionSerivce: PetitionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.openPetitions$ = this.petitionSerivce.getOpenPetitions();
  }

  navigateToPetition(petitionId: number) {
    this.router.navigateByUrl('petition/detail/' + petitionId)
  }
}
