import { EncryptedVotes } from "../voting-system/vote";

export interface RecastingVotingTransaction {
    electionID: number;
    voterAddress: string;
    encryptedVoteRSA: EncryptedVotes;
    encryptedVoteAES: EncryptedVotes;
}