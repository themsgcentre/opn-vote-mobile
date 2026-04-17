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
