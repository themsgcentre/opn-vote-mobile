import { TestBed } from '@angular/core/testing';
import QRCode from 'qrcode';

import { QrCodeService } from './qr-code-service';

describe('QrCodeService', () => {
  let service: QrCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generateDataUrl delegates to qrcode with defaults', async () => {
    const spy = jest
      .spyOn(QRCode, 'toDataURL')
      .mockImplementation(() => Promise.resolve('data:image/png;base64,xx'));

    const out = await service.generateDataUrl('payload');
    expect(out).toBe('data:image/png;base64,xx');
    expect(spy).toHaveBeenCalledWith('payload', { width: 300, margin: 2 });

    spy.mockRestore();
  });

  it('generateDataUrl forwards width and margin', async () => {
    const spy = jest.spyOn(QRCode, 'toDataURL').mockImplementation(() => Promise.resolve('data:'));

    await service.generateDataUrl('x', { width: 120, margin: 0 });
    expect(spy).toHaveBeenCalledWith('x', { width: 120, margin: 0 });

    spy.mockRestore();
  });
});
