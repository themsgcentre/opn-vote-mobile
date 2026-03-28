import { Injectable } from '@angular/core';
import { EncryptionType } from '../voting-system/encryption-type';
import { VoteOption } from '../voting-system/vote-option';
import { addSVSSignatureToVotingTransaction, createVotingTransactionWithoutSVSSignature, encryptVotes } from '../voting-system/voting';
import { VoterCredentials } from '../interfaces/voter-credentials';
import { createPublicClient, hashMessage, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { EthSignature } from '../voting-system/eth-signature';
import { postJson } from '../server/postJson';
import { EncryptionKey } from '../voting-system/encryption-key';
import { ENTRY_POINT, OPNVOTE_ADDRESS, PAYMASTER_ADDRESS, UrlPaths, UrlProperties } from '../globals/url';
import { createSmartAccountClient } from 'permissionless'
import { to7702SimpleSmartAccount } from 'permissionless/accounts'
import { gnosis } from "viem/chains"
import { createSvsForwardTransport, createVoteCalldata } from '../voting-system/bundler';
import { querySubgraph } from '../server/querySubgraph';

const CHAIN = gnosis;
const DELEGATION_ADDRESS = '0xe6Cae83BdE06E4c305530e199D7217f42808555B' as const
const OPNVOTE_ABI = [
  {
    type: 'function',
    name: 'vote',
    inputs: [
      { name: 'electionId', type: 'uint256' },
      { name: 'voter', type: 'address' },
      { name: 'svsSignature', type: 'bytes' },
      { name: 'voteEncrypted', type: 'bytes' },
      { name: 'voteEncryptedUser', type: 'bytes' },
      { name: 'unblindedElectionToken', type: 'bytes' },
      { name: 'unblindedSignature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  async sendVotes(votes: Record<number, VoteOption>, voterCredentials: VoterCredentials, electionPublicKey: string, isRecast: boolean) {
    const voterAccount = privateKeyToAccount(voterCredentials.voterWallet.privateKey as Hex)
    const voteArray = Object.values(votes).map((vote) => ({ value: vote })) as Array<{ value: VoteOption }>;

    const coordinatorKey: EncryptionKey = {
      hexString: electionPublicKey,
      encryptionType: EncryptionType.RSA,
    }

    // SVS sign
    const encryptedVotesRSA = await encryptVotes(
      voteArray, 
      coordinatorKey, 
      EncryptionType.RSA
    )
    const encryptedVotesAES = await encryptVotes(
      voteArray,
      voterCredentials.encryptionKey,
      EncryptionType.AES,
    )
    let votingTransaction = createVotingTransactionWithoutSVSSignature(
      voterCredentials,
      encryptedVotesRSA,
      encryptedVotesAES,
    )

    let sponsorMsgHash: string = '';
    if(!isRecast) {
      const msgHash = hashMessage(JSON.stringify(votingTransaction))
      const voterSig = await voterAccount.signMessage({ message: msgHash })
      const voterSignature: EthSignature = { hexString: voterSig }

      const svsSignData = await postJson<Record<string, unknown>>(
        `${UrlPaths.svsUrl}${UrlProperties.signVotingTransaction}`,
        { votingTransaction, voterSignature },
      )
      const svsSignatureRaw = ((svsSignData as any).blindedSignature ??
        (svsSignData as any).svsSignature) as EthSignature
      if (!svsSignatureRaw?.hexString)
        throw new Error(`SVS sign: unexpected response shape: ${JSON.stringify(svsSignData)}`)

      const signedVotingTransaction = addSVSSignatureToVotingTransaction(
        votingTransaction,
        svsSignatureRaw,
      )
      votingTransaction = signedVotingTransaction;
    }

    // SVS sponsor
    sponsorMsgHash = hashMessage(JSON.stringify(votingTransaction))
    const sponsorSig = await voterAccount.signMessage({ message: sponsorMsgHash })

    const { paymasterData, userOpParams } = await postJson<{
      paymasterData: Hex
      userOpParams: {
        nonce: string
        callGasLimit: string
        verificationGasLimit: string
        preVerificationGas: string
        paymasterVerificationGasLimit: string
        paymasterPostOpGasLimit: string
        maxFeePerGas: string
        maxPriorityFeePerGas: string
      }
    }>(`${UrlPaths.svsUrl}${UrlProperties.sponsor}`, {
      votingTransaction: votingTransaction,
      voterSignature: { hexString: sponsorSig },
    })

    // ERC-4337 submit
    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(UrlPaths.rpcnodeUrl),
    })
    const smartAccount = await to7702SimpleSmartAccount({
      client: publicClient,
      owner: voterAccount,
      accountLogicAddress: DELEGATION_ADDRESS,
      entryPoint: { address: ENTRY_POINT, version: '0.8' },
    })

    const voteCalldata = createVoteCalldata(votingTransaction, OPNVOTE_ABI) as Hex

    const smartAccountClient = createSmartAccountClient({
      client: publicClient,
      chain: CHAIN,
      account: smartAccount,
      paymaster: {
        async getPaymasterStubData() {
          return {
            paymaster: PAYMASTER_ADDRESS,
            paymasterData,
            isFinal: true as const,
            callGasLimit: BigInt(userOpParams.callGasLimit),
            verificationGasLimit: BigInt(userOpParams.verificationGasLimit),
            preVerificationGas: BigInt(userOpParams.preVerificationGas),
            paymasterVerificationGasLimit: BigInt(userOpParams.paymasterVerificationGasLimit),
            paymasterPostOpGasLimit: BigInt(userOpParams.paymasterPostOpGasLimit),
          }
        },
        async getPaymasterData() {
          throw new Error('getPaymasterData should not be called when isFinal: true')
        },
      },
      bundlerTransport: createSvsForwardTransport(UrlPaths.svsUrl),
      userOperation: {
        estimateFeesPerGas: async () => ({
          maxFeePerGas: BigInt(userOpParams.maxFeePerGas),
          maxPriorityFeePerGas: BigInt(userOpParams.maxPriorityFeePerGas),
        }),
      },
    })

    const isDeployed = await smartAccount.isDeployed()
    const sendParams = {
      calls: [{ to: OPNVOTE_ADDRESS, value: 0n, data: voteCalldata }] as const,
      nonce: BigInt(userOpParams.nonce),
    }

    let userOpHash: Hex
    if (!isDeployed) {
      const eoaNonce = await publicClient.getTransactionCount({ address: voterAccount.address })
      const authorization = await voterAccount.signAuthorization({
        address: DELEGATION_ADDRESS,
        chainId: CHAIN.id,
        nonce: eoaNonce,
      })
      userOpHash = await smartAccountClient.sendUserOperation({ ...sendParams, authorization })
    } else {
      userOpHash = await smartAccountClient.sendUserOperation(sendParams)
    }

    const receipt = await smartAccountClient.waitForUserOperationReceipt({ hash: userOpHash })
    const txHash = receipt.receipt.transactionHash

    if (!receipt.success) {
      throw new Error(`UserOp reverted: ${txHash}`)
    }
    await this.verifyVotes(voterCredentials.electionId, voterAccount.address, txHash)
    return txHash
  }

  async verifyVotes(electionId: number, voterAddress: string, txHash: string) {
    for (let attempt = 1; attempt <= 10; attempt++) {
      const { voteCasts } = await querySubgraph<{ voteCasts: { transactionHash: string }[] }>(
        UrlPaths.graphUrl,
        `{ voteCasts(where: { electionId: "${electionId}", voter: "${voterAddress}" }, first: 1) { transactionHash } }`,
      )
      if (voteCasts.length > 0) {
        break
      }
      if (attempt === 10) {
        throw Error('Vote not yet indexed after 10 attempts (subgraph may lag — tx succeeded)')
      }
    }
  }
}
