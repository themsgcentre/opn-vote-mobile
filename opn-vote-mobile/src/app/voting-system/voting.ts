import { ethers } from "ethers"
import { EncryptionKey } from "./encryption-key"
import { EncryptionType } from "./encryption-type"
import { EncryptedVotes, Vote } from "./vote"
import { bytesToHex, getSubtleCrypto, hexToBuffer, hexToBytes, validateCredentials, validateElectionID, validateEncryptedVotes, validateEncryptionKey, validateEthAddress, validateEthSignature, validateRecastingVotingTransaction, validateSignature, validateToken } from "../utils/utils"
import { RSA_BIT_LENGTH } from "../utils/constants"
import { VoteOption } from "./vote-option"
import { VotingTransaction } from "../interfaces/voting-transaction"
import { EthSignature } from "./eth-signature"
import { ServerError } from "./server-error"
import { UrlProperites } from "../globals/url-paths"
import { VoterCredentials } from "../interfaces/voter-credentials"

export async function encryptVotes(
  votes: Array<Vote>,
  encryptionKey: EncryptionKey,
  encryptionType: EncryptionType,
): Promise<EncryptedVotes> {
  if (encryptionKey.encryptionType !== encryptionType) {
    throw new Error(
      'Encryption type mismatch. Encryption type: ' +
        encryptionKey.encryptionType +
        ', Encryption type: ' +
        encryptionType,
    )
  }

  if (encryptionKey.encryptionType === EncryptionType.AES) {
    return await encryptVotesAES(votes, encryptionKey)
  } else if (encryptionKey.encryptionType === EncryptionType.RSA) {
    return await encryptVotesRSA(votes, encryptionKey)
  } else {
    throw new Error('Invalid encryption type. Encryption type: ' + encryptionKey.encryptionType)
  }
}

async function encryptVotesAES(
  votes: Array<Vote>,
  encryptionKey: EncryptionKey,
): Promise<EncryptedVotes> {
  try {
    validateEncryptionKey(encryptionKey, EncryptionType.AES)
    validateVotes(votes, EncryptionType.AES)

    const subtle: SubtleCrypto = getSubtleCrypto()

    const keyBuffer = new Uint8Array(hexToBytes(encryptionKey.hexString));
    const iv = new Uint8Array(ethers.randomBytes(12)) // 12 bytes (96 bits)
    const encoder = new TextEncoder()
    const voteBytes = encoder.encode(votesToString(votes))

    const cryptoKey = await subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    )
    const encrypted = await subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, voteBytes)
    const encryptedBytes = new Uint8Array(iv.length + encrypted.byteLength);
    encryptedBytes.set(iv, 0);
    encryptedBytes.set(new Uint8Array(encrypted), iv.length);
    const encryptedHex = bytesToHex(encryptedBytes);

    return { hexString: encryptedHex, encryptionType: EncryptionType.AES }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Failed to encrypt votes on AES: ' + error.message)
    } else {
      throw new Error('Failed to encrypt votes due to an unknown error. Error: ' + error)
    }
  }
}

async function encryptVotesRSA(
  votes: Array<Vote>,
  encryptionKey: EncryptionKey,
): Promise<EncryptedVotes> {
  if (votes.length === 0) {
    throw new Error('Encryption error: No votes provided.')
  }
  if (encryptionKey.encryptionType !== EncryptionType.RSA) {
    throw new Error(
      'Encryption type mismatch. Encryption type: ' +
        encryptionKey.encryptionType +
        ', expected: ' +
        EncryptionType.RSA,
    )
  }

  try {
    validateVotes(votes, EncryptionType.RSA)
    const subtle: SubtleCrypto = getSubtleCrypto()
    const publicKeyBuffer = hexToBuffer(encryptionKey.hexString)
    const publicKey = await subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt'],
    )

    const keyDetails = await subtle.exportKey('jwk', publicKey)
    if (keyDetails.n) {
      const keySize = (keyDetails.n.length * 6) / 8 
      const expectedKeySize = RSA_BIT_LENGTH / 8
      if (Math.abs(keySize - expectedKeySize) > 1) {
        throw new Error(
          `Invalid key size. Expected around ${RSA_BIT_LENGTH} bits, but got approximately ${Math.round(
            keySize * 8,
          )} bits.`,
        )
      }
    } else {
      throw new Error('Unable to determine key size.')
    }

    const votesString: string = votesToString(votes)
    const buffer = new TextEncoder().encode(votesString)
    const encrypted = await subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      buffer,
    )
    const encryptedVotes: EncryptedVotes = {
      hexString: ethers.hexlify(new Uint8Array(encrypted)),
      encryptionType: EncryptionType.RSA,
    }
    validateEncryptedVotes(encryptedVotes, EncryptionType.RSA)

    return encryptedVotes
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Failed to encrypt votes on RSA: ' + error.message)
    } else {
      throw new Error('Failed to encrypt votes due to an unknown error. Error: ' + error)
    }
  }
}


export function validateVotes(
  votes: Array<Vote>,
  encryptionType: EncryptionType
): void {
  const votesString: string = votesToString(votes) // currently same format for version 1 and 2
  const buffer = new TextEncoder().encode(votesString)

  if (encryptionType === EncryptionType.AES) {
    if (buffer.length === 0) {
      throw new Error('AES: Message cannot be empty.')
    }
    if (buffer.length >= 512) {
      throw new Error('AES: Message cannot be longer than 512 bytes.')
    }
  } else {
    
    const minMessageLength = 2
    
    const maxMessageLength = Math.floor(RSA_BIT_LENGTH / 8) - 2 * (256 / 8) - 2
    if (buffer.length > maxMessageLength) {
      throw new Error(
        `Message too long. Maximum length is ${maxMessageLength} bytes, but got ${buffer.length} bytes.`,
      )
    }
    if (buffer.length < minMessageLength) {
      throw new Error(
        `Message too short. Minimum length is ${minMessageLength} bytes, but got ${buffer.length} bytes.`,
      )
    }
  }
}



export function votesToString(votes: Array<Vote>): string {
  return votes
    .map(vote => {
      if (!Object.values(VoteOption).includes(vote.value)) {
        throw new Error(`Invalid vote option: ${vote.value}`)
      }
      return vote.value.toString()
    })
    .join(',')
}

export function createVoteRecastTransaction(voterCredentials: VoterCredentials, encryptedVotesRSA: EncryptedVotes, encryptedVotesAES: EncryptedVotes): VotingTransaction {
    validateCredentials(voterCredentials);
    validateEncryptedVotes(encryptedVotesRSA, EncryptionType.RSA);
    validateEncryptedVotes(encryptedVotesAES, EncryptionType.AES);
    const recastingVotingTransaction = {
        electionID: voterCredentials.electionId,
        voterAddress: voterCredentials.voterWallet.address,
        encryptedVoteRSA: encryptedVotesRSA,
        encryptedVoteAES: encryptedVotesAES,
    } as VotingTransaction;
    validateRecastingVotingTransaction(recastingVotingTransaction);
    return recastingVotingTransaction;
}

export function createVotingTransactionWithoutSVSSignature(voterCredentials: VoterCredentials, encryptedVotesRSA: EncryptedVotes, encryptedVotesAES: EncryptedVotes): VotingTransaction {
    validateEncryptedVotes(encryptedVotesRSA, EncryptionType.RSA);
    validateEncryptedVotes(encryptedVotesAES, EncryptionType.AES);
    validateToken(voterCredentials.unblindedElectionToken);
    validateSignature(voterCredentials.unblindedSignature);
    validateEthAddress(voterCredentials.voterWallet.address);
    if (voterCredentials.unblindedElectionToken.isMaster) {
        throw new Error('Voting transaction must not include a Master Token');
    }
    if (voterCredentials.unblindedElectionToken.isBlinded) {
        throw new Error('Voting transaction must not include a blinded Token');
    }
    if (voterCredentials.unblindedSignature.isBlinded) {
        throw new Error('Voting transaction must not include a blinded Signature');
    }
    const votingTransaction = {
        electionID: voterCredentials.electionId,
        voterAddress: voterCredentials.voterWallet.address,
        encryptedVoteRSA: encryptedVotesRSA,
        encryptedVoteAES: encryptedVotesAES,
        unblindedElectionToken: voterCredentials.unblindedElectionToken,
        unblindedSignature: voterCredentials.unblindedSignature,
        svsSignature: null,
    } as VotingTransaction;
    validateVotingTransaction(votingTransaction);
    return votingTransaction;
}

function validateVotingTransaction(votingTransaction: VotingTransaction) {
    if (!votingTransaction.unblindedElectionToken || !votingTransaction.unblindedSignature) {
        throw new Error('Invalid voting transaction: missing required properties');
    }
    validateElectionID(votingTransaction.electionID);
    validateEthAddress(votingTransaction.voterAddress);
    validateEncryptedVotes(votingTransaction.encryptedVoteRSA, EncryptionType.RSA);
    validateEncryptedVotes(votingTransaction.encryptedVoteAES, EncryptionType.AES);
    validateToken(votingTransaction.unblindedElectionToken);
    validateSignature(votingTransaction.unblindedSignature);
    if (votingTransaction.unblindedElectionToken.isMaster) {
        throw new Error('Voting transaction must not include a Master Token.');
    }
    if (votingTransaction.unblindedElectionToken.isBlinded) {
        throw new Error('Voting transaction must not include a blinded Token');
    }
    if (votingTransaction.unblindedSignature.isBlinded) {
        throw new Error('Voting transaction must not include a blinded Signature');
    }
    if (votingTransaction.svsSignature) {
        validateEthSignature(votingTransaction.svsSignature);
    }
}

export function addSVSSignatureToVotingTransaction(
  votingTransaction: VotingTransaction,
  svsSignature: EthSignature,
): VotingTransaction {
  if (votingTransaction.svsSignature) {
    throw new Error('Voting Transaction already contains SVS Signature')
  }

  validateVotingTransaction(votingTransaction)
  validateEthSignature(svsSignature)

  return {
    ...votingTransaction,
    svsSignature: svsSignature,
  }
}

export async function getAbi() {
  try {
    const response = await fetch("/assets/abi.json");
    if (!response.ok) {
      throw new ServerError(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new ServerError("Could not get ABI");
  }
}