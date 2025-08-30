import { gql } from '@apollo/client';

export const GET_FEED = gql`
  query GetFeed($offset: Int, $limit: Int) {
    getFeed(offset: $offset, limit: $limit) {
      id
      content
      media
      createdAt
      author {
        id
        username
        avatar
      }
      likes {
        id
      }
      comments {
        id
      }
    }
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!, $offset: Int, $limit: Int) {
    getUserPosts(userId: $userId, offset: $offset, limit: $limit) {
      id
      content
      media
      createdAt
      author {
        id
        username
        avatar
      }
      likes {
        id
      }
      comments {
        id
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($postId: ID!) {
    getComments(postId: $postId) {
      id
      content
      createdAt
      author {
        id
        username
        avatar
      }
      likes {
        id
      }
      replies {
        id
        content
        createdAt
        author {
          id
          username
          avatar
        }
        likes {
          id
        }
      }
    }
  }
`;
