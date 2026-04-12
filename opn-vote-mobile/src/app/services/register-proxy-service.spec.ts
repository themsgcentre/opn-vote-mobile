import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RegisterProxyService } from './register-proxy-service';

describe('RegisterProxyService', () => {
  let service: RegisterProxyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegisterProxyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
