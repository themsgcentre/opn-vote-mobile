import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ElectionOverviewComponent } from './election-overview.component';

describe('ElectionOverviewComponent', () => {
  let component: ElectionOverviewComponent;
  let fixture: ComponentFixture<ElectionOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ElectionOverviewComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
