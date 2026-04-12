import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ElectionListComponent } from './election-list.component';

describe('ElectionListComponent', () => {
  let component: ElectionListComponent;
  let fixture: ComponentFixture<ElectionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ElectionListComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
