import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NumberDisplayComponent } from './number-display.component';

describe('NumberDisplayComponent', () => {
  let component: NumberDisplayComponent;
  let fixture: ComponentFixture<NumberDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NumberDisplayComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
