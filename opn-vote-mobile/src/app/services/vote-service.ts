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

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  async sendVotes(votes: Record<number, VoteOption>, votingCredentials: VoterCredentials, electionPublicKey: string, isRecast: boolean) {
    // map votes into needed format
    const newVoteArray = Object.values(votes).map((vote) => ({ value: vote })) as Array<{ value: VoteOption }>;

    const encryptedVotesAES = await encryptVotes(newVoteArray, votingCredentials.encryptionKey, EncryptionType.AES);
    const encryptedVotesRSA = await encryptVotes(newVoteArray, { hexString: electionPublicKey, encryptionType: EncryptionType.RSA }, EncryptionType.RSA);

    let votingTransaction, votingTransactionFull;
    if (isRecast) {
        votingTransactionFull = createVoteRecastTransaction(votingCredentials, encryptedVotesRSA, encryptedVotesAES);
    } else {
        votingTransaction = createVotingTransactionWithoutSVSSignature(votingCredentials, encryptedVotesRSA, encryptedVotesAES);
        const voterWallet = new ethers.Wallet(votingCredentials.voterWallet.privateKey);
        const message = JSON.stringify(votingTransaction);
        const messageHash = ethers.hashMessage(message);

        const voterSignature = await voterWallet.signMessage(messageHash);
        const voterSignatureObject = {
            hexString: voterSignature
        };
        const svsSignature = await signTransaction(votingTransaction, voterSignatureObject);
        votingTransactionFull = addSVSSignatureToVotingTransaction(votingTransaction, svsSignature);
    }

    const abiData = await getAbi();
    const opnVoteInterface = new ethers.Interface(abiData);

    const provider = new ethers.JsonRpcProvider(UrlProperites.rpcnodeUrl); 
    const relayRequest = await createRelayRequest(votingTransactionFull, votingCredentials, UrlProperites.opnVoteContractAddress, opnVoteInterface, provider);
    const relay = new GelatoRelay();
    const signatureDataInitial = await createSignatureData(relayRequest, votingCredentials, relay, provider);

    const signatureDataInitialSerialized = JSON.stringify(signatureDataInitial, replacer);
    const gelatoForwardResult = await gelatoForward(signatureDataInitialSerialized);

    return gelatoForwardResult.data.taskId;
  }
}
