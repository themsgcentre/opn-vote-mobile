import { EncryptedVotes } from "./vote";

export interface RecastingVotingTransaction {
    electionID: number;
    voterAddress: string;
    encryptedVoteRSA: EncryptedVotes;
    encryptedVoteAES: EncryptedVotes;
}