import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { ElectionService } from 'src/app/services/election-service';

import { ElectionDetailViewComponent } from './election-detail-view.component';

describe('ElectionDetailViewComponent', () => {
  let component: ElectionDetailViewComponent;
  let fixture: ComponentFixture<ElectionDetailViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ElectionDetailViewComponent, IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
          },
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ElectionService,
          useValue: {
            getElectionInformation: () => of(null),
            getResults: () => of(null),
            getQuestions: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectionDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
