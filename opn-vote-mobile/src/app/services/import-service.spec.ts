import { TestBed } from '@angular/core/testing';

import { ImportService } from './import-service';

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('parseQrString accepts valid master-key export', () => {
    const raw = {
      type: 'master-key',
      version: 1,
      data: {
        masterToken: {
          hexString: '0x0' + 'a'.repeat(63),
          isMaster: true,
          isBlinded: false,
        },
        masterR: {
          hexString: '0x' + 'b'.repeat(64),
          isMaster: true,
        },
      },
    };
    const payload = service.parseQrString(JSON.stringify(raw));
    expect(service.isMasterKeyPayload(payload)).toBe(true);
    expect(service.isBallotPayload(payload)).toBe(false);
  });

  it('parseQrString accepts valid ballot export', () => {
    const raw = {
      type: 'ballot',
      version: 1,
      data: {
        electionId: 42,
        unblindedElectionTokenHex: '0x0' + 'c'.repeat(63),
        unblindedSignatureHex: '0x' + 'd'.repeat(64),
      },
    };
    const payload = service.parseQrString(JSON.stringify(raw));
    expect(service.isBallotPayload(payload)).toBe(true);
    expect(service.isMasterKeyPayload(payload)).toBe(false);
  });

  it('parseQrString throws on invalid JSON', () => {
    expect(() => service.parseQrString('not json')).toThrow();
  });

  it('parseQrString throws on invalid envelope', () => {
    expect(() => service.parseQrString(JSON.stringify({ type: 'other', version: 1, data: {} }))).toThrow();
  });
});
