import { useQuery } from '@apollo/client/react';
import { GET_POSTS } from '../graphql/queries/getPosts';

export const usePosts = (limit = 10) => {
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: {
      offset: 0,
      limit,
    },
    fetchPolicy: 'cache-and-network',
  });

  const loadMorePosts = () => {
    if (data?.getPosts?.length) {
      fetchMore({
        variables: {
          offset: data.getPosts.length,
          limit,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            getPosts: [
              ...prev.getPosts,
              ...fetchMoreResult.getPosts,
            ],
          };
        },
      });
    }
  };

  return {
    posts: data?.getPosts || [],
    loading,
    error,
    loadMorePosts,
  };
};
