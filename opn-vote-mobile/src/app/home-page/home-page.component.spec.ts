import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { BallotService } from '../services/ballot-service';
import { ElectionService } from '../services/election-service';
import { VotingStartDialogService } from '../services/voting-start-dialog-service';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent, IonicModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ElectionService, useValue: { getAllElectionInformations: () => of([]) } },
        { provide: BallotService, useValue: { hasBallot: () => of(false) } },
        { provide: VotingStartDialogService, useValue: { hasShownPrompt: async () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
