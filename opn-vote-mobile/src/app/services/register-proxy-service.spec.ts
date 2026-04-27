import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UrlPaths } from '../globals/url';
import { RegisterError } from '../globals/register-error';
import { RegisterErrorType } from '../globals/register-error.type';
import { RegisterProxyService } from './register-proxy-service';

describe('RegisterProxyService', () => {
  let service: RegisterProxyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegisterProxyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getBlindedSignature maps blinded signature from response', (done) => {
    const token = { hexString: '0x01', isMaster: false, isBlinded: true };
    service.getBlindedSignature('jwt', token as never).subscribe((sig) => {
      expect(sig.hexString).toBe('0xsig');
      expect(sig.isBlinded).toBe(true);
      done();
    });

    const req = httpMock.expectOne(UrlPaths.blindedSignatureUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt');
    expect(req.request.body).toEqual({ token });
    req.flush({ data: { blindedSignature: '0xsig' }, error: null });
  });

  it('getBlindedSignature throws RegisterError when API returns error', (done) => {
    service.getBlindedSignature('jwt', { hexString: '0x01', isMaster: false, isBlinded: true } as never).subscribe({
      error: (e) => {
        expect(e).toBeInstanceOf(RegisterError);
        expect((e as RegisterError).type).toBe(RegisterErrorType.GENERAL);
        done();
      },
    });

    const req = httpMock.expectOne(UrlPaths.blindedSignatureUrl);
    req.flush({ data: null, error: 'bad' });
  });

  it('getBlindedSignature throws when blindedSignature missing', (done) => {
    service.getBlindedSignature('jwt', { hexString: '0x01', isMaster: false, isBlinded: true } as never).subscribe({
      error: (e) => {
        expect(e).toBeInstanceOf(RegisterError);
        done();
      },
    });

    const req = httpMock.expectOne(UrlPaths.blindedSignatureUrl);
    req.flush({ data: {}, error: null });
  });
});
