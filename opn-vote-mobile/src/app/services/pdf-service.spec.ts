import { TestBed } from '@angular/core/testing';

import { PdfService } from './pdf-service';

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extractQrImportStringFromPdf throws on invalid PDF bytes', async () => {
    await expect(service.extractQrImportStringFromPdf(new Uint8Array([0, 1, 2]))).rejects.toThrow(
      'gültige PDF',
    );
  });
});
