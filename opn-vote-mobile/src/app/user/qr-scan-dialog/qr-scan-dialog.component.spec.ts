import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrScanDialogComponent } from './qr-scan-dialog.component';

type DecodeCallback = (decodedText: string) => void;

type Html5QrcodeTestHooks = {
  triggerDecode: ((onSuccess: DecodeCallback) => void) | null;
};

jest.mock('html5-qrcode', () => {
  const hooks: Html5QrcodeTestHooks = { triggerDecode: null };
  (globalThis as unknown as { __html5QrcodeTestHooks: Html5QrcodeTestHooks }).__html5QrcodeTestHooks =
    hooks;

  const Html5QrcodeScannerState = {
    UNKNOWN: 0,
    NOT_STARTED: 1,
    SCANNING: 2,
    PAUSED: 3,
  };

  return {
    Html5QrcodeScannerState,
    Html5Qrcode: jest.fn().mockImplementation(() => ({
      start: jest.fn(
        (_camera: unknown, _config: unknown, onSuccess: DecodeCallback) => {
          hooks.triggerDecode?.(onSuccess);
          return Promise.resolve(null);
        },
      ),
      stop: jest.fn(() => Promise.resolve()),
      clear: jest.fn(),
      getState: jest.fn(() => Html5QrcodeScannerState.SCANNING),
    })),
  };
});

function getHooks(): Html5QrcodeTestHooks {
  const h = (globalThis as unknown as { __html5QrcodeTestHooks?: Html5QrcodeTestHooks })
    .__html5QrcodeTestHooks;
  if (!h) {
    throw new Error('html5-qrcode test hooks missing');
  }
  return h;
}

describe('QrScanDialogComponent', () => {
  let fixture: ComponentFixture<QrScanDialogComponent>;

  beforeEach(async () => {
    getHooks().triggerDecode = null;
    await TestBed.configureTestingModule({
      imports: [QrScanDialogComponent],
    }).compileComponents();
  });

  afterEach(() => {
    getHooks().triggerDecode = null;
  });

  it('should create', async () => {
    fixture = TestBed.createComponent(QrScanDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits cancel when the cancel button is clicked', async () => {
    fixture = TestBed.createComponent(QrScanDialogComponent);
    const cancelSpy = jest.fn();
    fixture.componentInstance.cancel.subscribe(cancelSpy);
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.qr-scan-cancel') as HTMLButtonElement).click();
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('emits scanSuccess when the scanner reports a decode', async () => {
    getHooks().triggerDecode = (onSuccess) => {
      queueMicrotask(() => onSuccess('raw-qr'));
    };

    fixture = TestBed.createComponent(QrScanDialogComponent);
    const successSpy = jest.fn();
    fixture.componentInstance.scanSuccess.subscribe(successSpy);
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();

    expect(successSpy).toHaveBeenCalledWith('raw-qr');
  });
});
