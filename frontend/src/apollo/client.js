import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getMediaPosts: {
          keyArgs: false,
          merge(existing = [], incoming) {
            return incoming; // Always use the latest data for media posts
          }
        },
        getFeed: {
          keyArgs: false,
          merge(existing = [], incoming, { args }) {
            // If we have no args (fresh query) or it's the first page, return just incoming
            if (!args || args.offset === 0) return incoming;
            
            // Combine existing and incoming data for pagination
            const merged = existing ? [...existing] : [];
            const incomingPosts = incoming || [];
            
            // Deduplicate posts based on their ID
            const seenIds = new Set(merged.map(post => post.id));
            incomingPosts.forEach(post => {
              if (!seenIds.has(post.id)) {
                merged.push(post);
                seenIds.add(post.id);
              }
            });
            
            return merged;
          }
        },
        getUserPosts: {
          keyArgs: ['userId'],
          merge(existing = [], incoming, { args }) {
            if (!args || args.offset === 0) return incoming;
            
            const merged = existing ? [...existing] : [];
            const incomingPosts = incoming || [];
            
            // Deduplicate posts based on their ID
            const seenIds = new Set(merged.map(post => post.id));
            incomingPosts.forEach(post => {
              if (!seenIds.has(post.id)) {
                merged.push(post);
                seenIds.add(post.id);
              }
            });
            
            return merged;
          }
        },
        getComments: {
          keyArgs: ['postId'],
          merge(existing = [], incoming, { args }) {
            if (!args || args.offset === 0) return incoming;
            return [...existing, ...incoming];
          }
        }
      }
    },
    Post: {
      fields: {
        likes: {
          merge(existing = [], incoming) {
            return incoming; // Always use the latest likes data
          }
        },
        comments: {
          merge(existing = [], incoming) {
            return incoming; // Always use the latest comments data
          }
        }
      }
    }
  }
});

// Create an HTTP link
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Create a WebSocket link
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: () => ({
      authorization: typeof window !== 'undefined' && localStorage.getItem('token')
        ? `Bearer ${localStorage.getItem('token')}`
        : '',
    }),
  })
);

// Auth link for adding the token to requests
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (message.includes('not authenticated') || message.includes('invalid token')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/'; // Redirect to login
        }
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Split link for subscription support
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([authLink, errorLink, httpLink])
);

// Create Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getFeed: {
            // Merge function for pagination
            keyArgs: false,
            merge(existing = [], incoming, { args: { offset = 0 } }) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      User: {
        fields: {
          isFollowing: {
            read(_, { readField }) {
              const currentUserId = localStorage.getItem('userId');
              const followers = readField('followers') || [];
              return followers.some(
                (follower) => readField('id', follower) === currentUserId
              );
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
