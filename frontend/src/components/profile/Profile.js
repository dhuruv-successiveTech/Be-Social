"use client";

import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { POST_DELETED_SUBSCRIPTION, POST_UPDATED_SUBSCRIPTION } from "../../graphql/subscriptions/postSubscriptions";
import { useAuth } from "../../hooks/useAuth";
import UserListModal from "./UserListModal";
import { GET_USER_POSTS } from "../../graphql/queries";
import Post from "../post/Post";
import { LIKE_POST, UNLIKE_POST } from "../post/Feed";
import client from "../../apollo/client";

const GET_USER_PROFILE = gql`
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

const Profile = ({ userId }) => {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  const {
    loading: profileLoading,
    data: profileData,
    error: profileError,
  } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
    onCompleted: (data) => {
      setBio(data.getUser.bio);
      setAvatar(data.getUser.avatar);
    },
  });

  const {
    loading: postsLoading,
    data: postsData,
    error: postsError,
  } = useQuery(GET_USER_POSTS, {
    variables: { userId, offset: 0, limit: 10 },
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: { bio, avatar },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // const handleLike = async (postId, hasLiked) => {
  //   try {
  //     if (hasLiked) {
  //       await unlikePost({
  //         variables: { postId },
  //         update: (cache) => {
  //           cache.modify({
  //             id: `Post:${postId}`,
  //             fields: {
  //               likes(existingLikes = []) {
  //                 return existingLikes.filter(like => like.id !== currentUser?.id);
  //               }
  //             }
  //           });
  //         }
  //       });
  //     } else {
  //       await likePost({
  //         variables: { postId },
  //         update: (cache) => {
  //           cache.modify({
  //             id: `Post:${postId}`,
  //             fields: {
  //               likes(existingLikes = []) {
  //                 return [...existingLikes, { id: currentUser?.id, __typename: 'User' }];
  //               }
  //             }
  //           });
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error toggling like:", error);
  //   }
  // };

   const handleLike = async (postId, hasLiked) => {
    try {
      if (hasLiked) {
        await unlikePost({
          variables: { postId },
          update: (cache, { data: { unlikePost } }) => {
            cache.modify({
              id: cache.identify({ __typename: "Post", id: postId }),
              fields: {
                likes() {
                  return unlikePost.likes;
                },
              },
            });
          },
        });
      } else {
        await likePost({
          variables: { postId },
          update: (cache, { data: { likePost } }) => {
            cache.modify({
              id: cache.identify({ __typename: "Post", id: postId }),
              fields: {
                likes() {
                  return likePost.likes;
                },
              },
            });
          },
        });
      }
    } catch (error) {
      console.error("Error handling like/unlike:", error);
    }
  };
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser({ variables: { userId } });
      } else {
        await followUser({ variables: { userId } });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const openModal = (title, users) => {
    setModalTitle(title);
    setModalUsers(users);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (profileLoading) return <div>Loading profile...</div>;
  if (profileError || !profileData) return <div>Error loading profile.</div>;

  const { getUser: user } = profileData;
  const isCurrentUser = currentUser?.id === userId;
  const isFollowing = user.followers.some((f) => f.id === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={user.avatar || "https://via.placeholder.com/120"}
              alt={user.username}
              className="w-24 h-24 rounded-full"
            />
            <div className="ml-6">
              <h1 className="text-2xl text-gray-700  font-bold">{user.name}</h1>
              <p className="text-gray-600">@{user.username}</p>
              {!isEditing && <p className="mt-2">{user.bio}</p>}
            </div>
          </div>
          {isCurrentUser ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`px-4 py-2 rounded-lg ${
                isFollowing
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        )}

        <div className="flex mt-6 space-x-4">
          <div
            className="cursor-pointer"
            onClick={() => openModal("Followers", user.followers)}
          >
            <span className="text-gray-600 font-bold">{user.followers.length}</span>
            <span className="text-gray-600 font-bold ml-1">Followers</span>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => openModal("Following", user.following)}
          >
            <span className="text-gray-600 font-bold">{user.following.length}</span>
            <span className="text-gray-600 font-bold ml-1">Following</span>
          </div>
        </div>
      </div>

      {showModal && (
        <UserListModal
          title={modalTitle}
          users={modalUsers}
          onClose={closeModal}
        />
      )}

      {/* User's Posts */}
      <div className="mt-8">
        <h2 className="text-2xl text-gray-700  font-bold mb-4">Posts</h2>
        {postsLoading ? (
          <div>Loading posts...</div>
        ) : postsError ? (
          <div>Error loading posts</div>
        ) : (
          <div className="space-y-6">
            {postsData?.getUserPosts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onLike={handleLike}
                currentUser={currentUser}
                onPostDelete={(postId) => {
                  const currentPosts = client.readQuery({
                    query: GET_USER_POSTS,
                    variables: { userId, offset: 0, limit: 10 }
                  });
                  
                  client.writeQuery({
                    query: GET_USER_POSTS,
                    variables: { userId, offset: 0, limit: 10 },
                    data: {
                      getUserPosts: currentPosts.getUserPosts.filter(p => p.id !== postId)
                    }
                  });
                }}
                onPostUpdate={() => {
                  client.refetchQueries({
                    include: [GET_USER_POSTS]
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Subscribe to post updates and deletions
  // Subscribe to post deletions
  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.postDeleted) {
        const deletedPostId = data.data.postDeleted.id;
        
        // Update cache to remove the deleted post
        client.cache.modify({
          fields: {
            getUserPosts(existingPosts = [], { readField }) {
              return existingPosts.filter(
                postRef => readField('id', postRef) !== deletedPostId
              );
            },
            getFeed(existingPosts = [], { readField }) {
              return existingPosts.filter(
                postRef => readField('id', postRef) !== deletedPostId
              );
            }
          }
        });
      }
    }
  });

  // Subscribe to post updates
  useSubscription(POST_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.postUpdated) {
        const updatedPost = data.data.postUpdated;
        
        // Update cache with the new post content
        client.cache.modify({
          id: `Post:${updatedPost.id}`,
          fields: {
            content() {
              return updatedPost.content;
            },
            updatedAt() {
              return updatedPost.updatedAt;
            }
          }
        });
      }
    }
  });
};

export default Profile;
