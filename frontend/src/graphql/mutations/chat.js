import { gql } from "@apollo/client";

const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
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

const CREATE_CHAT = gql`
  mutation CreateChat(
    $participantIds: [ID!]!
    $isGroup: Boolean
    $groupName: String
  ) {
    createChat(
      participantIds: $participantIds
      isGroup: $isGroup
      groupName: $groupName
    ) {
      id
      participants {
        id
        username
        avatar
      }
      isGroupChat
      groupName
    }
  }
`;
export { SEND_MESSAGE, CREATE_CHAT };