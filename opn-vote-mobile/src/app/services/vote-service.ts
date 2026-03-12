import { Injectable } from '@angular/core';
import { EncryptionType } from '../voting-system/encryption-type';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  /*sendVotes(votes, votingCredentials, electionPublicKey: string, isRecast: boolean) {
    // map votes into needed format
    let newVoteArray = [];
    Object.keys(votes).map((key) => {
        newVoteArray[key] = { value: votes[key] };
    });

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

    const provider = new ethers.JsonRpcProvider(Config.env.rpcnodeUrl); // lets talk where to put all this stuff in biweekly - its on the list
    const relayRequest = await createRelayRequest(votingTransactionFull, votingCredentials, Config.env.opnVoteContractAddress, opnVoteInterface, provider);
    const relay = new GelatoRelay();
    const signatureDataInitial = await createSignatureData(relayRequest, votingCredentials, relay, provider);

    const signatureDataInitialSerialized = JSON.stringify(signatureDataInitial, replacer);
    const gelatoForwardResult = await gelatoForward(signatureDataInitialSerialized);

    return gelatoForwardResult.data.taskId;
  }*/
}
