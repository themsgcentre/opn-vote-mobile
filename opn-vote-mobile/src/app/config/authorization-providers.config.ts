export interface AuthorizationProvider {
  id: number;
  owner: string;
  apName: string;
  apUri: string;
}

export const AP_JWT_SIGN_PATH = '/api/dev/sign';

export const AUTHORIZATION_PROVIDERS: readonly AuthorizationProvider[] = [
  {
    id: 0,
    owner: '0x4BCEE727e6f7c3c896B22b513d8C259C8a32d290',
    apName: 'OpenPetition AP DEV',
    apUri: 'https://ap.dev.opn.vote',
  },
  {
    id: 2,
    owner: '0x4BCEE727e6f7c3c896B22b513d8C259C8a32d290',
    apName: 'OpenPetition AP APP_DEV',
    apUri: 'https://ap.dev.opn.vote',
  },
] as const;

export const DEFAULT_AUTH_PROVIDER_ID = 0;

export const ELECTION_AUTH_PROVIDER_ID: Readonly<Record<number, number>> = {};

export function getAuthorizationProviderForElection(electionId: number): AuthorizationProvider {
  const providerId = ELECTION_AUTH_PROVIDER_ID[electionId] ?? DEFAULT_AUTH_PROVIDER_ID;
  const provider = AUTHORIZATION_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) {
    throw new Error(`Kein Authorization Provider für id=${providerId} konfiguriert.`);
  }
  return provider;
}

export function buildApJwtSignUrl(apUri: string): string {
  const base = apUri.replace(/\/$/, '');
  return `${base}${AP_JWT_SIGN_PATH}`;
}
