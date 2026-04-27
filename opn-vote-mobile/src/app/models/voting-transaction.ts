import { EthSignature } from "./eth-signature";
import { Signature } from "./signature";
import { Token } from "./token";
import { EncryptedVotes } from "./vote";

export interface VotingTransaction {
    electionID: number;
    voterAddress: string;
    encryptedVoteRSA: EncryptedVotes;
    encryptedVoteAES: EncryptedVotes;
    unblindedElectionToken: Token;
    unblindedSignature: Signature;
    svsSignature: EthSignature | null;
}