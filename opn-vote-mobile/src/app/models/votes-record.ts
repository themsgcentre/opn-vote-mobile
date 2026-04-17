export type VotesRecord = Record<number, Results>;

export interface Results {
    yesVotes: number;
    noVotes: number;
    invalidVotes: number;
}