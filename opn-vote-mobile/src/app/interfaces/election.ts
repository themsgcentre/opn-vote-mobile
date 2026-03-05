export interface Election {
  id: number;

  title: string;
  summary: string;
  description: string;

  headerImage: {
    large: string;
    small: string;
  };

  questions: {
    text: string;
    imageUrl: string;
  }[];

  rsa: {
    n: string;
    e: string;
  }
  
  backLink: string;
  author: string;
  authorWalletAddress: string;

  authorizedVoterCount: number;
  registeredVoterCount: number;
  totalVotes: number;

  registrationStart: Date;
  registrationEnd: Date;
  votingStart: Date;
  votingEnd: Date;

  status: number;
  transactionHash: string;
}