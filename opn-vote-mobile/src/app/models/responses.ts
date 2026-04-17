export interface GetElectionResponse {
    election: any;
}

export interface GetElectionsResponse {
  elections: any[]; 
}

export interface BlindedSignatureResponse {
  data?: { blindedSignature: string };
  error?: string;
}

export interface GetResultsResponse {
  electionResultsPublisheds: {
      invalidVotes: string[];
      noVotes: string[];
      yesVotes: string[];
    }[];
};
