import { Injectable } from '@angular/core';
import { UrlPaths } from '../globals/url';
import { Signature } from '../voting-system/signature';
import { Token } from '../voting-system/token';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterErrorType } from '../globals/register-error.type';
import { RegisterError } from '../globals/register-error';
import { hexStringToBigInt, numberToHex32, padMessage, sha256Hex, validateR, validateRSAParams, validateSignature } from '../utils/utils';
import { EncryptionType } from '../voting-system/encryption-type';
import { Wallet } from 'ethers';
import { VoterCredentials } from '../interfaces/voter-credentials';
import { Ballot } from '../voting-system/ballot';
import { modInv } from 'bigint-crypto-utils';
import { RSAParams } from '../voting-system/rsa-params';
import { R } from '../voting-system/r';

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
      .post<{ data: { blindedSignature: string }; error: string | null }>(
        UrlPaths.blindedSignatureUrl,
        { token: blindedElectionToken },
        { headers }
      )
      .pipe(
        map((res) => {
          if (res.error) {
            throw new RegisterError(RegisterErrorType.GENERAL);
          }

          const blindedSignature = res.data?.blindedSignature;

          if (!blindedSignature) {
            throw new RegisterError(RegisterErrorType.GENERAL);
          }

          return {
            hexString: blindedSignature,
            isBlinded: true as const,
          };
        })
      );
  }

  async createVoterCredentialsFromStoredData(
    electionId: number,
    ballot: Ballot,
    masterToken: Token
  ): Promise<VoterCredentials> {
    const electionIDHex = {
      hexString: numberToHex32(electionId),
    };

    const walletPrivKeyInput =
      '0x' +
      masterToken.hexString.substring(2) +
      '|' +
      'Ethereum-Wallet' +
      '|' +
      electionIDHex.hexString.substring(2);

    const walletPrivKey = {
      hexString: await sha256Hex(walletPrivKeyInput),
    };

    const encryptionKeyInput =
      '0x' +
      masterToken.hexString.substring(2) +
      '|' +
      'Encryption-Key' +
      '|' +
      electionIDHex.hexString.substring(2);

    const encryptionKey = {
      hexString: await sha256Hex(encryptionKeyInput),
      encryptionType: EncryptionType.AES,
    };

    const voterWallet = new Wallet(walletPrivKey.hexString);

    return {
      electionId: electionId,
      unblindedElectionToken: {
        hexString: ballot.unblindedElectionTokenHex,
        isMaster: false,
        isBlinded: false,
      },
      unblindedSignature: {
        hexString: ballot.unblindedSignatureHex,
        isBlinded: false,
      },
      encryptionKey,
      voterWallet,
    };
  }

  unblindSignature(signature: Signature, r: R, rsaParams: RSAParams) {
      validateSignature(signature);
      validateR(r);
      validateRSAParams(rsaParams);
      if (!signature.isBlinded) {
          throw new Error("Only blinded Signatures can be unblinded");
      }
      if (r.isMaster) {
          throw new Error("Not allowed to unblind with Master R");
      }
      // Pad and convert hex strings to BigInts for calculation
      const paddedRbig = hexStringToBigInt(padMessage(r.hexString, rsaParams.NbitLength));
      const signatureBig = hexStringToBigInt(signature.hexString);
      // Perform unblinding: (Signature_blinded * r^-1) mod N
      const rInverse = modInv(paddedRbig, rsaParams.N);
      const unblindedSigBig = (signatureBig * rInverse) % rsaParams.N;
      const unblindedSignature = { hexString: '0x' + unblindedSigBig.toString(16).padStart(rsaParams.NbitLength / 4, '0'), isBlinded: false };
      validateSignature(unblindedSignature);
      return unblindedSignature;
  }
}
