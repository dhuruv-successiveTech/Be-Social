import { useQuery } from '@apollo/client/react';
import { GET_USER_POSTS } from '../graphql/queries/getFeed';

export const useUserPosts = (userId, limit = 10) => {
  const { data, loading, error, fetchMore } = useQuery(GET_USER_POSTS, {
    variables: {
      userId,
      offset: 0,
      limit,
    },
    fetchPolicy: 'cache-and-network',
  });

  const loadMorePosts = () => {
    if (data?.getUserPosts?.length) {
      fetchMore({
        variables: {
          offset: data.getUserPosts.length,
          limit,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            getUserPosts: [
              ...prev.getUserPosts,
              ...fetchMoreResult.getUserPosts,
            ],
          };
        },
      });
    }
  };

  return {
    posts: data?.getUserPosts || [],
    loading,
    error,
    loadMorePosts,
  };
};
