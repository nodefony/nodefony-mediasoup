import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  //uri: '/emersys/api',
  uri: '/api/graphql/users'
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const jwt = localStorage.getItem('user-token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      jwt: jwt ? `${jwt}` : "",
      Accept: 'application/json'
    }
  };
});

// Cache implementation
const cache = new InMemoryCache();

// Create the apollo client
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

export default  apolloClient ;
