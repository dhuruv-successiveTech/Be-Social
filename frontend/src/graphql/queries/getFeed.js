import { gql } from '@apollo/client';


export const GET_FEED = gql`
  query GetFeed($offset: Int, $limit: Int) {
    getFeed(offset: $offset, limit: $limit) {
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
    }
  }
`;