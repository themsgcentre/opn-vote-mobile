import { TestBed } from '@angular/core/testing';

import { ElectionProxyService } from './election-proxy-service';

describe('ElectionProxyService', () => {
  let service: ElectionProxyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectionProxyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
