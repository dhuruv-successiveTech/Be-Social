import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
 query Query($postId: ID!) {
  getComments(postId: $postId) {
    id
    content
    author {
      id
      username
      email
      name
      bio
      avatar
      followers {
        id
        username
        email
        name
        bio
        avatar
        role
        createdAt
        updatedAt
      }
      following {
        id
        username
        email
        name
        bio
        avatar
        role
        createdAt
        updatedAt
      }
      role
      createdAt
      updatedAt
    }
    post {
      id
      content
      media
      comments {
        id
        content
        createdAt
        updatedAt
      }
      shares {
        id
        username
        email
        name
        bio
        avatar
        role
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
    likes {
      id
      username
      email
      name
      bio
      avatar
      role
      createdAt
      updatedAt
    }
    parentComment {
      id
      content
      createdAt
      updatedAt
    }
    replies {
      id
      content
      author{
        id
        avatar
        username
      }
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
`;
