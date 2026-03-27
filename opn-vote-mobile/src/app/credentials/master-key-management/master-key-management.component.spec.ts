import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MasterKeyManagementComponent } from './master-key-management.component';
import { MasterKeySetupComponent } from '../master-key-setup/master-key-setup.component';

describe('MasterKeyManagementComponent', () => {
  let component: MasterKeyManagementComponent;
  let fixture: ComponentFixture<MasterKeyManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MasterKeyManagementComponent, MasterKeySetupComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterKeyManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
