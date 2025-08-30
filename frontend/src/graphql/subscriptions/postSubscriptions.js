import { gql } from '@apollo/client';

export const POST_DELETED_SUBSCRIPTION = gql`
  subscription OnPostDeleted {
    postDeleted {
      id
    }
  }
`;

export const POST_UPDATED_SUBSCRIPTION = gql`
  subscription OnPostUpdated {
    postUpdated {
      id
      content
      updatedAt
    }
  }
`;
