import { Injectable } from '@angular/core';
import { Token } from '../models/token';
import { gcdBigInt, hexStringToBigInt, numberToHex32, padMessage, sha256Hex, validateElectionID, validateR, validateRSAParams, validateSignature, validateToken } from '../utils/utils';
import { PREFIX_BLINDED_TOKEN, PREFIX_UNBLINDED_TOKEN } from '../utils/constants';
import { R } from '../models/r';
import { RSAParams } from '../models/rsa-params';
import { modInv, modPow } from 'bigint-crypto-utils';
import { Signature } from '../models/signature';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  async deriveElectionUnblindedToken(electionID: number, masterToken: Token): Promise<Token> {

      validateElectionID(electionID)
      validateToken(masterToken)

      if (!masterToken.isMaster) {
          throw new Error("Only Master Token can be used to derive Election Token")
      }

      if (masterToken.isBlinded) {
          throw new Error("Only unblinded Master Token can be used to derive Election Token")
      }

      let nonce = 0;
      let tokenHexString;
      do {
        tokenHexString = await sha256Hex(
          `${electionID}|${masterToken.hexString}|${nonce}`
        );
        nonce++;
      } while (!tokenHexString.startsWith(PREFIX_UNBLINDED_TOKEN));
      return { hexString: tokenHexString, isMaster: false, isBlinded: false }
  }

  blindToken(unblindedToken: Token, r: R, rsaParams: RSAParams): Token {
      if (!rsaParams.e) { throw new Error("Register public Exponent not defined") }
      validateToken(unblindedToken)
      validateR(r)
      validateRSAParams(rsaParams)

      if (unblindedToken.isBlinded) {
          throw new Error("Only unblinded Tokens can be blinded")
      }

      if (unblindedToken.isMaster) {
          throw new Error("Not allowed not blind a Master Token")
      }

      if (r.isMaster) {
          throw new Error("Not allowed to blind with Master R")
      }

      if (!rsaParams.e) {
          throw new Error("RSA Parameter e not defined")
      }


      // Pad Unblinded Token to be full-domain
      const unblindedTokenHex: string = unblindedToken.hexString.toLowerCase();
      const paddedTokenHex: string = padMessage(unblindedTokenHex, rsaParams.NbitLength)
      const paddedTokenBig: bigint = BigInt(paddedTokenHex);

      if (paddedTokenBig < 3n || paddedTokenBig > rsaParams.N - 1n) {
          throw new Error("Padded Token out of range")
      }
      const paddedRbig: bigint = hexStringToBigInt(padMessage(r.hexString, rsaParams.NbitLength))

      const blindedHexBig: bigint = (paddedTokenBig * modPow(paddedRbig, rsaParams.e, rsaParams.N)) % rsaParams.N;
      const blindedToken: Token = {
          hexString: '0x' + blindedHexBig.toString(16).padStart(rsaParams.NbitLength / 4, '0'),
          isMaster: unblindedToken.isMaster,
          isBlinded: true
      }
      validateToken(blindedToken, false)
      return blindedToken;
  }

  async deriveElectionR(electionID: number, masterR: R, unblindedElectionToken: Token, rsaParams: RSAParams) {
      validateElectionID(electionID)
      validateR(masterR)
      validateToken(unblindedElectionToken)
      validateRSAParams(rsaParams)
      if (unblindedElectionToken.isMaster) {
          throw new Error("Master Token cannot be used for R Generation");
      }
      if (unblindedElectionToken.isBlinded) {
          throw new Error("Only unblinded Tokens can be used for R Generation");
      }
      if (!masterR.isMaster) {
          throw new Error("Only Master R can be used for R Generation");
      }
      let iterations = 0;
      let blindedToken;
      let nonce = 0n;
      // Initial calculation of electionR as bigint
      let electionRSeed = await sha256Hex((`${electionID}|${masterR.hexString}|${0}`));
      let electionRBig = hexStringToBigInt(padMessage(electionRSeed, rsaParams.NbitLength));
      let electionR;
      do {
          iterations++;
          let gcd;
          // Recalculate electionR with an incremented nonce until a valid R, generating a 0x1 prefixed blinded token
          do {
              if (nonce > 0n) {
                  electionRSeed = await sha256Hex((`${electionID}|${masterR.hexString}|${nonce}`));
                  electionRBig = hexStringToBigInt(padMessage(electionRSeed, rsaParams.NbitLength));
              }
              nonce = nonce + 1n;
              electionRBig = electionRBig % rsaParams.N;
              gcd = gcdBigInt(electionRBig, rsaParams.N);
          } while (gcd !== 1n ||
              electionRBig >= rsaParams.N ||
              electionRBig <= 1n);
          electionR = { hexString: electionRSeed, isMaster: false };
          blindedToken = this.blindToken(unblindedElectionToken, electionR, rsaParams);
          validateToken(blindedToken, false);
      } while (!blindedToken.hexString.startsWith(PREFIX_BLINDED_TOKEN)); // Ensure blinded token has a '0x1' prefix
      validateR(electionR);
      return electionR;
  }
}

