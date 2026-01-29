import { TestBed } from '@angular/core/testing';

import { BallotPaperService } from './ballot-paper-service';

describe('BallotPaperService', () => {
  let service: BallotPaperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BallotPaperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
