import { gql } from "@apollo/client";

const GET_CHATS = gql`
  query GetChats {
    getChats {
      id
      participants {
        id
        username
        avatar
      }
      messages {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      isGroupChat
      groupName
    }
  }
`;

const GET_CHAT = gql`
  query GetChat($chatId: ID!) {
    getChat(chatId: $chatId) {
      id
      participants {
        id
        username
        avatar
      }
      messages {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      isGroupChat
      groupName
    }
  }
`;

const GET_CURRENT_USER_FOLLOWING = gql`
  query GetCurrentUserFollowing {
    getCurrentUser {
      id
      following {
        id
        username
        avatar
      }
    }
  }
`;

export { GET_CHAT, GET_CHATS, GET_CURRENT_USER_FOLLOWING };
