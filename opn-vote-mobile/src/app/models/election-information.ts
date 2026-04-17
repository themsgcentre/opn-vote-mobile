import { ElectionStatus } from "./election-status";

export interface ElectionInformation {
  id: number;

  title: string;
  summary: string;
  description: string;

  headerImage: {
    large: string;
    small: string;
  };
  
  backLink: string;
  author: string;

  authorizedVoterCount: number;
  registeredVoterCount: number;
  totalVotes: number;

  registrationStart: Date;
  registrationEnd: Date;
  votingStart: Date;
  votingEnd: Date;

  status: ElectionStatus;
}