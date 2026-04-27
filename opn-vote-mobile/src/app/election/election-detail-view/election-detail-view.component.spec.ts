import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { of } from 'rxjs';

import { ElectionService } from 'src/app/services/election-service';

import { ElectionDetailViewComponent } from './election-detail-view.component';

describe('ElectionDetailViewComponent', () => {
  let fixture: ComponentFixture<ElectionDetailViewComponent>;
  const navigate = jest.fn(() => Promise.resolve(true));
  const present = jest.fn();
  const alertCreate = jest.fn().mockResolvedValue({
    present,
  } as unknown as HTMLIonAlertElement);

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ElectionDetailViewComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' })),
            snapshot: { paramMap: convertToParamMap({ id: '7' }) },
          },
        },
        { provide: Router, useValue: { navigate } },
        {
          provide: ElectionService,
          useValue: {
            getElectionInformation: () => of(null),
            getResults: () => of(null),
            getQuestions: () => of([]),
          },
        },
        {
          provide: AlertController,
          useValue: { create: alertCreate } as unknown as AlertController,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectionDetailViewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('onParticipateClicked navigates to registration with route election id', async () => {
    await fixture.componentInstance.onParticipateClicked();
    expect(navigate).toHaveBeenCalledWith(['/election/register', 7]);
  });

  it('onParticipateClicked shows an alert when election id is invalid', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ElectionDetailViewComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' })),
            snapshot: { paramMap: convertToParamMap({ id: 'not-an-id' }) },
          },
        },
        { provide: Router, useValue: { navigate } },
        {
          provide: ElectionService,
          useValue: {
            getElectionInformation: () => of(null),
            getResults: () => of(null),
            getQuestions: () => of([]),
          },
        },
        {
          provide: AlertController,
          useValue: { create: alertCreate } as unknown as AlertController,
        },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(ElectionDetailViewComponent);
    f.detectChanges();
    await f.whenStable();

    await f.componentInstance.onParticipateClicked();
    expect(navigate).not.toHaveBeenCalled();
    expect(alertCreate).toHaveBeenCalled();
    expect(present).toHaveBeenCalled();
  });
});
