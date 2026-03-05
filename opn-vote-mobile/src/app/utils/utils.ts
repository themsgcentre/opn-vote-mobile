import { shake256 } from "js-sha3"
import { R } from "../voting-system/r"
import { RSAParams } from "../voting-system/rsa-params"
import { Token } from "../voting-system/token"
import { PREFIX_BLINDED_TOKEN, PREFIX_UNBLINDED_TOKEN, RSA_BIT_LENGTH } from "./constants"
import { Signature } from "../voting-system/signature"
import { EncryptionType } from "../voting-system/encryption-type"
import { ElectionCredentials } from "../voting-system/election-credentials"
import { EncryptionKey } from "../voting-system/encryption-key"
import { ethers } from "ethers"

export function validateElectionID(electionID: number) {
    if (!Number.isInteger(electionID)) {
        throw new Error(`Invalid election ID: ${electionID}. Must be an integer.`)
    }

    if (electionID < 0 || electionID > 1000000) {
        throw new Error('Election ID out of range')
    }
}

export function validateToken(token: Token, validatePrefix: boolean = true): void {
    if (token.isBlinded && token.isMaster) {
        throw new Error('Master token must not be blinded')
    }

    let expectedLength = 66 // Default length for unblinded tokens (SHA-256 Output)
    if (token.isBlinded) {
        expectedLength = RSA_BIT_LENGTH / 4 + 2 // Adjust length for blinded tokens: Convert bit length to hex length and add 2 for '0x' prefix.
    }

    validateHexString(token, expectedLength, true)

    // Check if tokenBig is within range
    const tokenBig = hexStringToBigInt(token.hexString)
    if (tokenBig <= 2n) {
        throw new Error('Token value is too low')
    }

    const upperBound = (1n << BigInt(RSA_BIT_LENGTH)) - 1n
    if (tokenBig >= upperBound) {
        throw new Error('Token value is too high')
    }

    // Prefix is only for election Token (blinded & unblided) checked
    if (!token.isMaster && validatePrefix) {
        if (
        token.isBlinded &&
        !token.hexString.toLowerCase().startsWith(PREFIX_BLINDED_TOKEN.toLowerCase())
        ) {
        throw new Error(`Blinded Tokens must be ${PREFIX_BLINDED_TOKEN.toLowerCase()} prefixed`)
        } else if (
        !token.isBlinded &&
        !token.hexString.toLowerCase().startsWith(PREFIX_UNBLINDED_TOKEN.toLowerCase())
        ) {
        throw new Error(`Unblinded Tokens must be ${PREFIX_UNBLINDED_TOKEN.toLowerCase()} prefixed`)
        }
    }
}

export function validateHexString(
    hexStringObject: { hexString: string },
    expectedLength: number,
    shouldBeLowerCase: boolean = false,
    allowZero: boolean = false,
    ): void {
    if (hexStringObject.hexString.length !== expectedLength) {
        throw new Error(
        `Invalid token length. Expected length: ${expectedLength}, but got: ${hexStringObject.hexString.length}. Token: ${hexStringObject.hexString}`,
        )
    }

    if (!isValidHex(hexStringObject.hexString, shouldBeLowerCase, allowZero)) {
        throw new Error(`Invalid token format. Token: ${hexStringObject.hexString}`)
    }
}

export function isValidHex(
    str: string,
    shouldBeLowerCase: boolean = false,
    allowZero: boolean = false,
):  boolean {
    if (!str || str.length < 3) {
        return false
    }

    str = str.startsWith('0x') ? str.substring(2) : str

    const regexp = /^[0-9a-fA-F]+$/

    if (!regexp.test(str)) {
        return false
    }

    if (shouldBeLowerCase && str !== str.toLowerCase()) {
        return false
    }

    if (!allowZero && BigInt(`0x${str}`) === BigInt(0)) {
        return false
    }

    if (str.length % 2 !== 0) {
        return false
    }

    return true
}

export function hexStringToBigInt(hexString: string): bigint {
    // Ensure the hexString is 0x prefixed
    if (!hexString.startsWith('0x')) {
        hexString = '0x' + hexString
    }

    // Convert the hex string to a bigint
    const messageBigInt = BigInt(hexString)
    return messageBigInt
}

export function numberToHex32(value: number | bigint): string {
  let hex = BigInt(value).toString(16);
  hex = hex.padStart(64, '0'); // 32 bytes
  return '0x' + hex;
}

export async function sha256Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);

    let hex = '0x';
    for (const b of hashArray) {
        hex += b.toString(16).padStart(2, '0');
    }

    return hex;
}

export function validateR(r: R): void {
    const expectedLength = 66; // Default length sha 256-output
    validateHexString(r, expectedLength, true);
    const rBig = hexStringToBigInt(r.hexString);
    // Check lower bound
    if (rBig <= 2n) {
        throw new Error('R value is too low');
    }
}

export function validateRSAParams(rsaParams: RSAParams) {
    // Check if the bit length is less than 2048 bits
    if (rsaParams.NbitLength < RSA_BIT_LENGTH) {
        throw new Error('RSA bit length must be at least 2048 bits');
    }
    // Check if 'e' is within the typical range
    if (rsaParams.e !== undefined && (rsaParams.e < 3n || rsaParams.e % 2n === 0n)) {
        throw new Error("RSA exponent 'e' must be an odd number greater than 2");
    }
    // Check if NbitLength matches the real bit length of N
    const actualBitLength = getBitLength(rsaParams.N);
    if (rsaParams.NbitLength !== actualBitLength) {
        throw new Error('NbitLength does not match the actual bit length of N');
    }
    if (rsaParams.D !== undefined) {
        // D should be at least half the bit length of N
        const minDValue = 2n ** BigInt(rsaParams.NbitLength / 2);
        if (rsaParams.D < minDValue) {
            throw new Error("RSA private exponent 'D' is too small");
        }
    }
}

export function getBitLength(bigIntValue: bigint): number {
    return bigIntValue.toString(2).length;
}

export function gcdBigInt(a: bigint, b: bigint): bigint {
    if (b === 0n) return a;
    return gcdBigInt(b, a % b);
}

export function padMessage(message: string, bitLength: number): string {
    const shake = shake256.create(bitLength - 1);
    shake.update(message.toLowerCase());
    return '0x' + shake.hex();
}

export function validateSignature(signature: Signature): void {
  const expectedLength = RSA_BIT_LENGTH / 4 + 2 // length for signature: Convert bit length to hex length and add 2 for '0x' prefix.
  validateHexString(signature, expectedLength, true)

  // Check if tokenBig is within range
  const signatureBig = hexStringToBigInt(signature.hexString)
  if (signatureBig <= 2n) {
    throw new Error('Signature value is too low')
  }

  const upperBound = (1n << BigInt(RSA_BIT_LENGTH)) - 1n
  if (signatureBig >= upperBound) {
    throw new Error('Signature value is too high')
  }
}

export function validateCredentials(credentials: ElectionCredentials): void {
    validateSignature(credentials.unblindedSignature)
    validateToken(credentials.unblindedElectionToken)
    validateElectionID(credentials.electionID)

    const voterWalletPrivKey = credentials.voterWallet.privateKey
    validateHexString({ hexString: voterWalletPrivKey }, 66)
    validateEthAddress(credentials.voterWallet.address)

    validateEncryptionKey(credentials.encryptionKey, EncryptionType.AES)

    if (credentials.unblindedSignature.isBlinded) {
        throw new Error('Signature must be unblinded.')
    }
    if (credentials.unblindedElectionToken.isBlinded) {
        throw new Error('Election token must be unblinded.')
    }
    if (credentials.unblindedElectionToken.isMaster) {
        throw new Error('Election token must not be a master token.')
    }
}

export function validateEncryptionKey(
    encryptionKey: EncryptionKey,
    encryptionType: EncryptionType,
    ): void {
    if (encryptionType === EncryptionType.AES) {
        validateHexString(encryptionKey, 66, true)
    } else if (encryptionType === EncryptionType.RSA) {
        validateHexString(encryptionKey, 32, true)
    } else {
        throw new Error(`Invalid encryption type: ${encryptionType}`)
    }
}

export function validateEthAddress(address: string): void {
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid Ethereum address provided.')
  }
}