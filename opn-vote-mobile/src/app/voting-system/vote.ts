import { VoteOption } from "./vote-option";

export interface Vote {
    key: number;
    selected: VoteOption;
}