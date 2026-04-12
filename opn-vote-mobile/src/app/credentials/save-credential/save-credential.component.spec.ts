import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaveCredentialComponent } from './save-credential.component';

describe('SaveCredentialComponent', () => {
  let component: SaveCredentialComponent;
  let fixture: ComponentFixture<SaveCredentialComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SaveCredentialComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveCredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
