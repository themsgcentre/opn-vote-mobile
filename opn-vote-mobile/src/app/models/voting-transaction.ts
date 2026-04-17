import { EthSignature } from "../voting-system/eth-signature";
import { Signature } from "../voting-system/signature";
import { Token } from "../voting-system/token";
import { EncryptedVotes } from "../voting-system/vote";

export interface VotingTransaction {
    electionID: number;
    voterAddress: string;
    encryptedVoteRSA: EncryptedVotes;
    encryptedVoteAES: EncryptedVotes;
    unblindedElectionToken: Token;
    unblindedSignature: Signature;
    svsSignature: EthSignature | null;
}