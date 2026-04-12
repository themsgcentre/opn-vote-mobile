import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BallotImportComponent } from './ballot-import.component';

describe('BallotImportComponent', () => {
  let component: BallotImportComponent;
  let fixture: ComponentFixture<BallotImportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BallotImportComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BallotImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
