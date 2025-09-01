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

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
      }
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      likes {
        id
      }
    }
  }
`;