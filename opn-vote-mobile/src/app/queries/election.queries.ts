import { gql } from "apollo-angular";

export const GET_ELECTION = gql`
  query election($id: ID!) {
    election(id: $id) {
      id
      votingStartTime
      votingEndTime
      registrationEndTime
      registrationStartTime
      transactionHash
      totalVotes
      registeredVoterCount
      authorizedVoterCount
      status
      registerPublicKeyE
      registerPublicKeyN
      privateKey
      descriptionIpfsCid
      descriptionBlob
      publicKey
    }
  }
`;

export const GET_ALL_ELECTIONS = gql`
  query GetElections {
    elections(orderBy: id, orderDirection: desc) {
      id
      votingStartTime
      votingEndTime
      registrationEndTime
      registrationStartTime
      transactionHash
      totalVotes
      registeredVoterCount
      authorizedVoterCount
      status
      registerPublicKeyE
      registerPublicKeyN
      privateKey
      descriptionIpfsCid
      descriptionBlob
      publicKey
    }
  }
`;

export const GET_ELECTION_RESULTS = gql`
   query getResults($id: ID!) {                                                                                                                                                                 
    electionResultsPublisheds(where: { electionId: $id }) {                                                                                                                       
      invalidVotes                                                                                                                                                                 
      noVotes                                                                                                                                                                     
      yesVotes
    }                                                                                                                                                                             
  }
`;