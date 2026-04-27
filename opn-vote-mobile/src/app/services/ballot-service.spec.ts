import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { of } from 'rxjs';

import { BallotService } from './ballot-service';
import { MasterKeyService } from './master-key-service';
import { RegisterProxyService } from './register-proxy-service';
import { TokenService } from './token-service';

jest.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('BallotService', () => {
  let service: BallotService;

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStoragePlugin.get as jest.Mock).mockRejectedValue(new Error('no key'));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BallotService,
        { provide: MasterKeyService, useValue: { getMasterKey: () => of(null) } },
        { provide: RegisterProxyService, useValue: {} },
        { provide: TokenService, useValue: {} },
      ],
    });
    service = TestBed.inject(BallotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('hasBallot emits false when no ballot and no master key', (done) => {
    service.hasBallot(99).subscribe((v) => {
      expect(v).toBe(false);
      done();
    });
  });

  it('listElectionIdsWithValidBallot emits empty when index missing', (done) => {
    service.listElectionIdsWithValidBallot().subscribe((ids) => {
      expect(ids).toEqual([]);
      done();
    });
  });
});
