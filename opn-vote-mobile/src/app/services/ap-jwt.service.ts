import { Injectable } from '@angular/core';
import {
  buildApJwtSignUrl,
  getAuthorizationProviderForElection,
} from '../config/authorization-providers.config';

@Injectable({
  providedIn: 'root',
})
export class ApJwtService {
  getProviderDisplayName(electionId: number): string {
    return getAuthorizationProviderForElection(electionId).apName;
  }

  getJwtSignUrlForElection(electionId: number): string {
    const apUri = getAuthorizationProviderForElection(electionId).apUri;
    return buildApJwtSignUrl(apUri);
  }

  async fetchJwtForElection(electionId: number, id: number): Promise<{ token: string; apName: string }> {
    const provider = getAuthorizationProviderForElection(electionId);
    const url = buildApJwtSignUrl(provider.apUri);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: { electionId, id },
        expiresIn: '1d',
      }),
    });

    if (!response.ok) {
      throw new Error(`JWT-Anfrage fehlgeschlagen (${response.status})`);
    }

    const res = (await response.json()) as { data?: { token?: string } };
    const token = res.data?.token;
    if (!token || typeof token !== 'string') {
      throw new Error('JWT-Antwort ohne gültiges Token');
    }

    return { token, apName: provider.apName };
  }
}
