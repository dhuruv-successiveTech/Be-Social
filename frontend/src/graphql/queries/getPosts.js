import { gql } from '@apollo/client';

export const GET_MEDIA_POSTS = gql`
  query GetMediaPosts {
    getMediaPosts {
      id
      content
      media
      author {
        id
        username
        avatar
      }
      createdAt
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts($offset: Int, $limit: Int) {
    getPosts(offset: $offset, limit: $limit) {
      id
      content
      media
      createdAt
      author {
        id
        username
        avatar
      }
      likes {
        id
      }
      comments {
        id
      }
      createdAt
    }
  }
`;

export const GET_POST_BY_ID = gql`
  query getPost($id: ID!) {
    getPost(id: $id) {
      id
      content
      media
      createdAt
      author {
        id
        username
        avatar
      }
      likes {
        id
        username
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
          avatar
        }
      }
    }
  }
`;
