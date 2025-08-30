import { gql } from '@apollo/client';

export const POST_LIKED_SUBSCRIPTION = gql`
  subscription PostLiked {
    postLiked {
      id
      likes {
        id
      }
      likesCount
    }
  }
`;

export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription CommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
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
      }
    }
  }
`;
