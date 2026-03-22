import { VotingTransaction } from "../interfaces/voting-transaction";
import { validateCredentials, validateRecastingVotingTransaction, validateVotingTransaction } from "../utils/utils";
import { RecastingVotingTransaction } from "../interfaces/recasting-voting-transaction";
import { CallWithERC2771Request, ERC2771Type, GelatoRelay, SignatureData } from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";
import { ServerError } from "./server-error";
import { UrlProperites } from "../globals/url-paths";
import { VoterCredentials } from "../interfaces/voter-credentials";

export async function createRelayRequest(
  votingTransaction: VotingTransaction | RecastingVotingTransaction,
  credentials: VoterCredentials,
  opnVoteContractAddress: string,
  opnVoteABI: ethers.Interface | ethers.InterfaceAbi,
  provider: ethers.JsonRpcProvider,
): Promise<CallWithERC2771Request> {

  // Validate the voting transaction and credentials
  validateCredentials(credentials)

  const transactionSender = credentials.voterWallet.address;

  // Check if the transaction sender address matches voter address
  if (transactionSender.toLowerCase() !== votingTransaction.voterAddress.toLowerCase()) {
    throw new Error(`Transaction sender (${transactionSender}) does not match voter address (${votingTransaction.voterAddress}).`);
  }

  let svsSignatureHex: string = "0x"
  let unblindedElectionTokenHex: string = "0x"
  let unblindedSignatureHex: string = "0x"

  // Check if the transaction is a regular voting transaction or a recasting voting transaction
  if ('unblindedElectionToken' in votingTransaction && 'unblindedSignature' in votingTransaction && votingTransaction.svsSignature) {
    validateVotingTransaction(votingTransaction as VotingTransaction);
    svsSignatureHex = votingTransaction.svsSignature.hexString
    unblindedElectionTokenHex = votingTransaction.unblindedElectionToken.hexString,
      unblindedSignatureHex = votingTransaction.unblindedSignature.hexString
  } else {
    validateRecastingVotingTransaction(votingTransaction as RecastingVotingTransaction);
  }


  try {
    const opnVoteContract: ethers.Contract = new ethers.Contract(opnVoteContractAddress, opnVoteABI, credentials.voterWallet);

    // Create transaction calldata
    const { data } = await opnVoteContract["vote"].populateTransaction(
      votingTransaction.electionID,
      votingTransaction.voterAddress,
      svsSignatureHex,
      votingTransaction.encryptedVoteRSA.hexString,
      votingTransaction.encryptedVoteAES.hexString,
      unblindedElectionTokenHex,
      unblindedSignatureHex
    );


    const chainId = (await provider.getNetwork()).chainId
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const userDeadline = currentTimeInSeconds + (3 * 24 * 60 * 60) // 3 days from now as unix timestamp

    return {
      chainId: chainId,
      target: opnVoteContractAddress,
      data: data,
      user: transactionSender,
      userDeadline: userDeadline,
      isConcurrent: false,

    };

  }
  catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create relay request: ${error.message}`);
    } else {
      throw new Error(`Failed to create relay request: ${error}`);
    }
  }
}

export async function createSignatureData(
  request: CallWithERC2771Request,
  credentials: VoterCredentials,
  relay: GelatoRelay | null,
  provider: ethers.JsonRpcProvider): Promise<SignatureData> {


  validateCredentials(credentials)

  let signerWithProvider: ethers.Wallet
  try {
    signerWithProvider = new ethers.Wallet(credentials.voterWallet.privateKey, provider);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create signer with provider: ${error.message}`);
    } else {
      throw new Error(`Failed to create signer with provider: ${error}`);
    }
  }
  if (!relay) {
    relay = new GelatoRelay();
  }
  return await relay.getSignatureDataERC2771(request, signerWithProvider, ERC2771Type.SponsoredCall);
}

export async function gelatoForward(signatureDataInitialSerialized: string) {
    const gelatoHeader = new Headers();
    gelatoHeader.append("Content-Type", "application/json");
    const options = {
        method: "POST",
        headers: gelatoHeader,
        body: signatureDataInitialSerialized,
    };

    console.log(signatureDataInitialSerialized)

    const response = await fetch(UrlProperites.gelatoForwardUrl, options);
    const responseText = await response.text();

    if (response.status >= 500) {
        throw new ServerError(`Server ${response.status}: ${responseText}`);
    }
    try {
        return await response.json();
    } catch (error) {
        throw new ServerError("2");
    }
}