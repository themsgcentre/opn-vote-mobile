import { VoteOption } from "./vote-option";

export const defaultOptions = [
    { text: "Ich stimme zu.", voteOption: VoteOption.Yes },
    { text: "Ich stimme nicht zu.", voteOption: VoteOption.No },
    { text: "Ich enthalte mich.", voteOption: VoteOption.Abstain }
];