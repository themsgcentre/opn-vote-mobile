import { TestBed } from '@angular/core/testing';

import { MasterkeyService } from './masterkey-service';

describe('MasterkeyService', () => {
  let service: MasterkeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterkeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
