import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { VoteHistoryComponent } from './vote-history.component';
import { ElectionService } from '../../services/election-service';
import { VoteParticipationStorageService } from '../../services/vote-participation-storage.service';

describe('VoteHistoryComponent', () => {
  let component: VoteHistoryComponent;
  let fixture: ComponentFixture<VoteHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VoteHistoryComponent, IonicModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ElectionService, useValue: { getAllElectionInformations: () => of([]) } },
        {
          provide: VoteParticipationStorageService,
          useValue: {
            getRegisteredIds: async () => [],
            getVotedIds: async () => [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VoteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
