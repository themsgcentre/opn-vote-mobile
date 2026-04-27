import { TestBed } from '@angular/core/testing';

import { TokenService } from './token-service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deriveElectionUnblindedToken rejects non-master token', async () => {
    await expect(
      service.deriveElectionUnblindedToken(1, {
        hexString: '0x0' + 'a'.repeat(63),
        isMaster: false,
        isBlinded: false,
      }),
    ).rejects.toThrow('Only Master Token');
  });

  it('deriveElectionUnblindedToken rejects blinded master token', async () => {
    await expect(
      service.deriveElectionUnblindedToken(1, {
        hexString: '0x1' + 'b'.repeat(63),
        isMaster: true,
        isBlinded: true,
      }),
    ).rejects.toThrow('Master token must not be blinded');
  });
});
