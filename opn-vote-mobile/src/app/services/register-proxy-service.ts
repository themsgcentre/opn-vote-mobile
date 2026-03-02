import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BlindedSignatureResponse } from '../interfaces/responses';
import { UrlPaths } from '../globals/url-paths';
import { RegisterError } from '../globals/register-error';
import { RegisterErrorType } from '../globals/register-error.type';

@Injectable({
  providedIn: 'root',
})
export class RegisterProxyService {
  constructor(private http: HttpClient) {}

  getBlindedSignature(jwt: string, blindedElectionTokenHex: string): Observable<{ hexString: string; isBlinded: true }> {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    });

    return this.http
  .post<BlindedSignatureResponse>(
    UrlPaths.blindedSignatureUrl,
    { token: blindedElectionTokenHex },
    { headers }
  )
  .pipe(
    map((res) => {
      const err = (res.error ?? '').toLowerCase();

      if (err) {
        if (err.includes('already registered')) {
          throw new RegisterError(RegisterErrorType.ALREADYREGISTERED);
        }

        if (err.includes('failed to authenticate jwt')) {
          throw new RegisterError(RegisterErrorType.JWTAUTH);
        }

        throw new RegisterError(RegisterErrorType.GENERAL);
      }

      const sig = res.data?.blindedSignature;
      
      if (!sig) {
        throw new RegisterError(RegisterErrorType.GENERAL);
      }

      return { hexString: sig, isBlinded: true as const };
    })
  );
  }
}
