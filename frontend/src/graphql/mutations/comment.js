import { gql } from '@apollo/client';

export const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $content: String!) {
    createComment(postId: $postId, content: $content) {
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
    }
  }
`;
