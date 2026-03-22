import { Injectable } from '@angular/core';
import { EncryptionType } from '../voting-system/encryption-type';
import { ethers } from 'ethers';
import { VoteOption } from '../voting-system/vote-option';
import { addSVSSignatureToVotingTransaction, createVoteRecastTransaction, createVotingTransactionWithoutSVSSignature, encryptVotes, getAbi } from '../voting-system/voting';
import { signTransaction } from '../voting-system/transaction';
import { UrlProperites } from '../globals/url-paths';
import { createRelayRequest, createSignatureData, gelatoForward } from '../voting-system/gelato';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { replacer } from '../utils/utils';
import { VoterCredentials } from '../interfaces/voter-credentials';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  async sendVotes(votes: Record<number, VoteOption>, voterCredentials: VoterCredentials, electionPublicKey: string, isRecast: boolean) {
    const voterAccount = privateKeyToAccount(voterCredentials.voterWallet.privateKey as Hex)

    // SVS sign
    const encryptedVotesRSA = await encryptVotes(votes, coordinatorKey, EncryptionType.RSA)
    const encryptedVotesAES = await encryptVotes(
      votes,
      voterCredentials.encryptionKey,
      EncryptionType.AES,
    )
    const votingTransaction = createVotingTransactionWithoutSVSSignature(
      voterCredentials,
      encryptedVotesRSA,
      encryptedVotesAES,
    )

    const msgHash = hashMessage(JSON.stringify(votingTransaction))
    const voterSig = await voterAccount.signMessage({ message: msgHash })
    const voterSignature: EthSignature = { hexString: voterSig }

    const svsSignData = await postJson<Record<string, unknown>>(
      `${svsUrl}/api/votingTransaction/sign`,
      { votingTransaction, voterSignature },
    )
    const svsSignatureRaw = ((svsSignData as any).blindedSignature ??
      (svsSignData as any).svsSignature) as EthSignature
    if (!svsSignatureRaw?.hexString)
      throw new Error(`SVS sign: unexpected response shape: ${JSON.stringify(svsSignData)}`)
    log('SVS signature received ✓', svsSignatureRaw.hexString.slice(0, 20) + '...')

    const signedVotingTransaction = addSVSSignatureToVotingTransaction(
      votingTransaction,
      svsSignatureRaw,
    )
  }
}
