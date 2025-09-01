import { gql } from "@apollo/client";

const MESSAGE_SUBSCRIPTION = gql`
  subscription MessageReceived($chatId: ID!) {
    messageReceived(chatId: $chatId) {
      id
      content
      sender {
        id
        username
      }
      createdAt
    }
  }
`;

export { MESSAGE_SUBSCRIPTION };