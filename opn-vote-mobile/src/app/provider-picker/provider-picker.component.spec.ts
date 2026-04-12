import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProviderPickerComponent } from './provider-picker.component';

describe('ProviderPickerComponent', () => {
  let component: ProviderPickerComponent;
  let fixture: ComponentFixture<ProviderPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProviderPickerComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
