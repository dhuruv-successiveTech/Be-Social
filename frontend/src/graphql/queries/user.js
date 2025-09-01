import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      name
      bio
      avatar
      followers {
        id
        username
        name
        avatar
      }
      following {
        id
        username
        name
        avatar
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      username
      name
      avatar
      bio
      followers {
        id
      }
    }
  }
`;