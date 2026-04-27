import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveCredentialComponent } from './save-credential.component';

describe('SaveCredentialComponent', () => {
  let fixture: ComponentFixture<SaveCredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveCredentialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveCredentialComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the placeholder template', () => {
    expect(fixture.nativeElement.textContent).toContain('save-credential works!');
  });
});
