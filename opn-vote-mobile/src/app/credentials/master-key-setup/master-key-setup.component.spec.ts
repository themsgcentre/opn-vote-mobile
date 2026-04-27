import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterKeySetupComponent } from './master-key-setup.component';

describe('MasterKeySetupComponent', () => {
  let fixture: ComponentFixture<MasterKeySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterKeySetupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterKeySetupComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits createClicked when the first primary action is activated', () => {
    const spy = jest.fn();
    fixture.componentInstance.createClicked.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('.action-button.primary');
    expect(buttons.length).toBe(2);
    (buttons[0] as HTMLElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits importClicked when the second primary action is activated', () => {
    const spy = jest.fn();
    fixture.componentInstance.importClicked.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('.action-button.primary');
    (buttons[1] as HTMLElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
