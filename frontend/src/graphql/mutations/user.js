import { gql } from "@apollo/client";

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($bio: String, $avatar: String) {
    updateProfile(bio: $bio, avatar: $avatar) {
      id
      bio
      avatar
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      followers {
        id
        username
      }
    }
  }
`;

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      followers {
        id
        username
      }
    }
  }
`;

export { UPDATE_PROFILE, FOLLOW_USER, UNFOLLOW_USER };
