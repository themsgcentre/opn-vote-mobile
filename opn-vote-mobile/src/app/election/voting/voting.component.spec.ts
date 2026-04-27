import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';
import { VoteDraftService } from 'src/app/services/vote-draft-service';
import { VoteParticipationStorageService } from 'src/app/services/vote-participation-storage.service';
import { VoteService } from 'src/app/services/vote-service';
import { VotingReminderService } from 'src/app/services/voting-reminder-service';

import { VotingComponent } from './voting.component';

describe('VotingComponent', () => {
  let component: VotingComponent;
  let fixture: ComponentFixture<VotingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VotingComponent, IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
          },
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ElectionService,
          useValue: {
            getElectionInformation: () => of(null),
            getQuestions: () => of([]),
            loadQuestions: () => of([]),
            getPublicKey: () => of(undefined),
          },
        },
        { provide: VoteService, useValue: {} },
        { provide: VoteDraftService, useValue: { load: async () => null } },
        { provide: VotingReminderService, useValue: { isReminderScheduled: async () => false } },
        {
          provide: BallotService,
          useValue: {
            hasBallot: () => of(false),
            getCredentials: () => of(null),
          },
        },
        { provide: VoteParticipationStorageService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
