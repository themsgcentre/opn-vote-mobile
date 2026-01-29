import { TestBed } from '@angular/core/testing';

import { MasterKeyService } from './master-key-service';

describe('MasterKeyService', () => {
  let service: MasterKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
