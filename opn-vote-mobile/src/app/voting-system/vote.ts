import { EncryptionType } from "./encryption-type";
import { VoteOption } from "./vote-option";

export interface QuestionVote {
    key: number;
    selected: VoteOption;
}

export type Vote = {
    value: VoteOption;
}

export type EncryptedVotes = {
    hexString: string;
    encryptionType: EncryptionType;
};