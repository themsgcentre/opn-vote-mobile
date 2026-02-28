import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

export const graphClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://graphql.dev.opn.vote/subgraphs/name/opnvote-dev-0x6df22e4e4ede7e4e73b3608bcb5508b892a1fd28/',
  }),
  cache: new InMemoryCache(),
});