import { gql } from "@apollo/client";

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationReceived {
    notificationReceived {
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
