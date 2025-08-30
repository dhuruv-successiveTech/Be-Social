import { gql } from '@apollo/client';

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!, $offset: Int, $limit: Int) {
    getUserPosts(userId: $userId, offset: $offset, limit: $limit) {
      id
      content
      media
      createdAt
      updatedAt
      author {
        id
        username
        avatar
      }
      likes {
        id
        username
        avatar
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
          avatar
        }
      }
    }
  }
`;
