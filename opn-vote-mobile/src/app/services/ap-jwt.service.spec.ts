import { TestBed } from '@angular/core/testing';

import { AP_JWT_SIGN_PATH } from '../config/authorization-providers.config';
import { ApJwtService } from './ap-jwt.service';

describe('ApJwtService', () => {
  let service: ApJwtService;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApJwtService);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getJwtSignUrlForElection appends sign path to provider URI', () => {
    const url = service.getJwtSignUrlForElection(0);
    expect(url).toContain('https://ap.dev.opn.vote');
    expect(url).toBe(`https://ap.dev.opn.vote${AP_JWT_SIGN_PATH}`);
  });

  it('getProviderDisplayName returns configured AP name', () => {
    expect(service.getProviderDisplayName(0)).toBe('OpenPetition AP DEV');
  });

  it('fetchJwtForElection returns token on success', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { token: 'jwt-token-value' } }),
    } as unknown as Response);
    globalThis.fetch = fetchMock as typeof fetch;

    const out = await service.fetchJwtForElection(0, 123);
    expect(out).toEqual({ token: 'jwt-token-value', apName: 'OpenPetition AP DEV' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/dev/sign'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({
      payload: { electionId: 0, voterId: 123 },
      expiresIn: '1d',
    });
  });

  it('fetchJwtForElection throws on non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
    } as unknown as Response) as typeof fetch;

    await expect(service.fetchJwtForElection(0, 1)).rejects.toThrow('JWT-Anfrage fehlgeschlagen (503)');
  });

  it('fetchJwtForElection throws when response has no token', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response) as typeof fetch;

    await expect(service.fetchJwtForElection(0, 1)).rejects.toThrow('JWT-Antwort ohne gültiges Token');
  });
});
