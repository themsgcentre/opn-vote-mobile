import { Injectable } from '@angular/core';
import { UrlPaths } from '../globals/url';
import { Signature } from '../voting-system/signature';
import { Token } from '../voting-system/token';
import { numberToHex32, sha256Hex, validateCredentials, validateHexString, validateSignature, validateToken } from '../utils/utils';
import { EncryptionType } from '../voting-system/encryption-type';
import { ethers } from 'ethers';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BlindedSignatureResponse } from '../interfaces/responses';
import { RegisterErrorType } from '../globals/register-error.type';
import { RegisterError } from '../globals/register-error';
import { VoterCredentials } from '../interfaces/voter-credentials';
import { EncryptionKey } from '../voting-system/encryption-key';

@Injectable({
  providedIn: 'root',
})
export class RegisterProxyService {
  constructor(private http: HttpClient) { }
  
  getBlindedSignature(jwt: string, blindedElectionToken: Token): Observable<Signature> {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    });

    return this.http
      .post<BlindedSignatureResponse>(
        UrlPaths.blindedSignatureUrl,
        { token: blindedElectionToken },
        { headers }
      )
      .pipe(
        map((res) => {
          const err = (res.error ?? '').toLowerCase();

          if (err.includes('already registered')) {
            throw new RegisterError(RegisterErrorType.ALREADYREGISTERED);
          }

          if (err.includes('failed to authenticate jwt')) {
            throw new RegisterError(RegisterErrorType.JWTAUTH);
          }

          if (err) {
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

  async createVoterCredentials(unblindedSignature: Signature, unblindedElectionToken: Token, masterToken: Token, electionId: number): Promise<VoterCredentials> {
      if (masterToken.isBlinded) {
          throw new Error("Master token must be unblinded.");
      }
      if (!masterToken.isMaster) {
          throw new Error("Provided token must be a master token.");
      }
      validateSignature(unblindedSignature);
      validateToken(unblindedElectionToken);
      validateToken(masterToken);
      // Convert the election ID to hex and validate
      const electionIDHex = { hexString: numberToHex32(electionId) };
      validateHexString(electionIDHex, 66, false, true);
      
      // Combine master token and election ID to hex strings to derive the election-specific voter wallet private key and encryption key (user encrypted vote)
      const walletPrivKeyInput =
        '0x' + masterToken.hexString.substring(2) +
        "|" + "Ethereum-Wallet" +
        "|" + electionIDHex.hexString.substring(2);

      const walletPrivKey = {
        hexString: await sha256Hex(walletPrivKeyInput)
      };

      const encryptionKeyInput = '0x' + masterToken.hexString.substring(2) + "|" + "Encryption-Key" + "|" + electionIDHex.hexString.substring(2);
      const encryptionKey = { hexString: await sha256Hex((encryptionKeyInput)), encryptionType: EncryptionType.AES } as EncryptionKey;
      const voterWallet = new ethers.Wallet(walletPrivKey.hexString);
      const voterCredentials = { 
        unblindedSignature: unblindedSignature, 
        unblindedElectionToken, 
        voterWallet, 
        encryptionKey, 
        electionId 
      } as VoterCredentials;
      validateCredentials(voterCredentials);
      return voterCredentials;
  }
}
