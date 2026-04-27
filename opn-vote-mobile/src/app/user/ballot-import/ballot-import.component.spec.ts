import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BallotImportComponent } from './ballot-import.component';

describe('BallotImportComponent', () => {
  let fixture: ComponentFixture<BallotImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BallotImportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BallotImportComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits infoClicked when the info icon is activated', () => {
    const spy = jest.fn();
    fixture.componentInstance.infoClicked.subscribe(spy);
    (fixture.nativeElement.querySelector('.info-icon') as HTMLElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits importClicked when the import button is activated', () => {
    const spy = jest.fn();
    fixture.componentInstance.importClicked.subscribe(spy);
    (fixture.nativeElement.querySelector('.action-button.primary') as HTMLElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('shows importError in an alert region', () => {
    fixture.componentRef.setInput('importError', 'Import fehlgeschlagen');
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement | null;
    expect(alert?.textContent?.trim()).toBe('Import fehlgeschlagen');
  });

  it('does not render error region when importError is null', () => {
    fixture.componentRef.setInput('importError', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
