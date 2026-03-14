import { TestBed } from '@angular/core/testing';

import { RegisterProxyService } from './register-proxy-service';

describe('RegisterProxyService', () => {
  let service: RegisterProxyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterProxyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
