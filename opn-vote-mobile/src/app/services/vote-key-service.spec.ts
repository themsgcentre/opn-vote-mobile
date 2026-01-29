import { TestBed } from '@angular/core/testing';

import { VoteKeyService } from './vote-key-service';

describe('VoteKeyService', () => {
  let service: VoteKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoteKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
