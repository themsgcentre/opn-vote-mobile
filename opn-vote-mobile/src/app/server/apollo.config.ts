import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { UrlPaths } from '../globals/url';

export const graphClient = new ApolloClient({
  link: new HttpLink({
    uri: UrlPaths.graphUrl,
  }),
  cache: new InMemoryCache(),
});