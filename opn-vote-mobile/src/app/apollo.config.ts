import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { UrlProperites } from './globals/url-paths';

export const graphClient = new ApolloClient({
  link: new HttpLink({
    uri: UrlProperites.graphUrl,
  }),
  cache: new InMemoryCache(),
});