import { gql } from '@apollo/client';

export const UPDATE_POST = gql`
  mutation UpdatePost($postId: ID!, $content: String!) {
    updatePost(postId: $postId, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId) {
      id
    }
  }
`;
