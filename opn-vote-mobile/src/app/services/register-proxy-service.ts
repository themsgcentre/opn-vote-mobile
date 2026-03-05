import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import globalConst from '../utils/constants';
import { UrlPaths } from '../globals/url-paths';
import { Signature } from '../voting-system/signature';
import { Token } from '../voting-system/token';
import { numberToHex32, sha256Hex, validateCredentials, validateHexString, validateSignature, validateToken } from '../utils/utils';
import { EncryptionType } from '../voting-system/encryption-type';
import { ethers } from 'ethers';

export class ServerError extends Error { }

@Injectable({
  providedIn: 'root',
})
export class RegisterProxyService {
  async getBlindedSignature(jwttoken: string, blindedElectionToken: string): Promise<{ hexString: string; isBlinded: boolean }> {
      const blindedElectionTokenFormatted = { token: blindedElectionToken };
      const signOptions = {
          method: "POST",
          headers: new Headers(
              {
                  'content-type': 'application/json',
                  'Authorization': 'Bearer ' + jwttoken
              }
          ),
          body: JSON.stringify(blindedElectionTokenFormatted)
      };

      const response = await fetch(UrlPaths.blindedSignatureUrl, signOptions);
      const jsondata = await response.json();
      if (jsondata.error?.length > 0) {
          switch (jsondata.error.toLowerCase()) {
              case 'already registered':
                  throw new ServerError(globalConst.ERROR.ALREADYREGISTERED);
              case 'failed to authenticate jwt':
                  throw new ServerError(globalConst.ERROR.JWTAUTH);
              default:
                  throw new ServerError(globalConst.ERROR.GENERAL);
          }
      }

      return { hexString: jsondata.data.blindedSignature, isBlinded: true };
  }

  async createVoterCredentials(unblindedSignature: Signature, unblindedElectionToken: Token, masterToken: Token, electionID: number) {
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
      const electionIDHex = { hexString: numberToHex32(electionID) };
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
      const encryptionKey = { hexString: await sha256Hex((encryptionKeyInput)), encryptionType: EncryptionType.AES };
      const voterWallet = new ethers.Wallet(walletPrivKey.hexString);
      const voterCredentials = { unblindedSignature, unblindedElectionToken, voterWallet, encryptionKey, electionID };
      validateCredentials(voterCredentials);
      return voterCredentials;
  }
}
