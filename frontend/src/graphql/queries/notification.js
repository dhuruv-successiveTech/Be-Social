import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      id
      type
      sender {
        id
        username
        avatar
      }
      post {
        id
        content
      }
      comment {
        id
        content
      }
      chat {
        id
      }
      read
      createdAt
    }
  }
`;