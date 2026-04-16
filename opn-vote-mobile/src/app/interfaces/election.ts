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

  status: number; // status code of the election (0 pending, 1 open, 2 ended, 3 results published, 4 canceled)
}