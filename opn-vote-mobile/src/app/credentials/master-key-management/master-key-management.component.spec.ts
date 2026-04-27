import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterKeyManagementComponent } from './master-key-management.component';

describe('MasterKeyManagementComponent', () => {
  let fixture: ComponentFixture<MasterKeyManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterKeyManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterKeyManagementComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows loading copy when state is loading', () => {
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Laden');
  });

  it('does not render error region when importError is unset', () => {
    fixture.componentRef.setInput('importError', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows importError in an alert region', () => {
    fixture.componentRef.setInput('importError', 'Import fehlgeschlagen');
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement | null;
    expect(alert?.textContent?.trim()).toBe('Import fehlgeschlagen');
  });

  it('forwards create and import from embedded setup when state is none', () => {
    const createSpy = jest.fn();
    const importSpy = jest.fn();
    fixture.componentInstance.createClicked.subscribe(createSpy);
    fixture.componentInstance.importClicked.subscribe(importSpy);
    fixture.componentRef.setInput('state', 'none');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('app-master-key-setup .action-button.primary');
    expect(buttons.length).toBe(2);
    (buttons[0] as HTMLElement).click();
    (buttons[1] as HTMLElement).click();
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(importSpy).toHaveBeenCalledTimes(1);
  });

  it('emits exportClicked and deleteClicked when present actions are used', () => {
    const exportSpy = jest.fn();
    const deleteSpy = jest.fn();
    fixture.componentInstance.exportClicked.subscribe(exportSpy);
    fixture.componentInstance.deleteClicked.subscribe(deleteSpy);
    fixture.componentRef.setInput('state', 'present');
    fixture.detectChanges();

    const primary = fixture.nativeElement.querySelector('.action-button.primary') as HTMLElement;
    const danger = fixture.nativeElement.querySelector('.action-button.danger') as HTMLElement;
    primary.click();
    danger.click();
    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('emits infoClicked when the info icon is activated', () => {
    const spy = jest.fn();
    fixture.componentInstance.infoClicked.subscribe(spy);
    (fixture.nativeElement.querySelector('.info-icon') as HTMLElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
