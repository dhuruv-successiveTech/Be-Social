"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription, useApolloClient } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../../hooks/useAuth";
import CommentModal from "../comment/CommentModal";
import { POST_LIKED_SUBSCRIPTION, POST_UPDATED_SUBSCRIPTION, POST_DELETED_SUBSCRIPTION } from "../../graphql/subscriptions";
import Post from "./Post";
import { Card } from '../common/Card';

const GET_FEED = gql`
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

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
      }
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      likes {
        id
      }
    }
  }
`;


const Feed = () => {
  const { user } = useAuth();
  const limit = 10;
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [offset, setOffset] = useState(0);
  const client = useApolloClient();

  // Subscribe to post likes
  useSubscription(POST_LIKED_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (data?.postLiked) {
        const likedPost = data.postLiked;
        // Update the cache when a post is liked/unliked
        client.cache.modify({
          id: client.cache.identify({ __typename: 'Post', id: likedPost.id }),
          fields: {
            likes(existingLikes = []) {
              return likedPost.likes;
            },
            likesCount(existingCount) {
              return likedPost.likes.length;
            },
            isLiked(existingIsLiked) {
              return likedPost.likes.some(like => like.id === user?.id);
            }
          }
        });
      }
    }
  });

  // Subscribe to post updates
  useSubscription(POST_UPDATED_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (data?.postUpdated) {
        const updatedPost = data.postUpdated;
        client.cache.modify({
          id: client.cache.identify({ __typename: 'Post', id: updatedPost.id }),
          fields: {
            content() { return updatedPost.content; },
            updatedAt() { return updatedPost.updatedAt; }
          }
        });
      }
    }
  });

  // Subscribe to post deletions
  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (data?.postDeleted) {
        const deletedPostId = data.postDeleted.id;
        client.cache.modify({
          fields: {
            getFeed(existingPosts = [], { readField }) {
              return existingPosts.filter(
                postRef => readField('id', postRef) !== deletedPostId
              );
            }
          }
        });
        // Optionally evict the deleted post from cache
        client.cache.evict({ id: client.cache.identify({ __typename: 'Post', id: deletedPostId }) });
        client.cache.gc();
      }
    }
  });

  const { loading, error, data, fetchMore } = useQuery(GET_FEED, {
    variables: { offset: 0, limit },
    onCompleted: (data) => {
      if (data?.getFeed) {
        setOffset(data.getFeed.length);
      }
    }
  });

  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);

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

  const handleCommentClick = (postId) => {    
    const post = data.getFeed.find(p => p.id === postId);
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
  };
  
  const loadMore = () => {
    fetchMore({
      variables: {
        offset: offset, // use state offset
        limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.getFeed.length === 0) {
          return prev; // no more posts
        }
                
        // Deduplicate posts by id
        const existingIds = new Set(prev.getFeed.map((p) => p.id));
        const newPosts = fetchMoreResult.getFeed.filter((p) => !existingIds.has(p.id));
        console.log(newPosts);
        
        const updatedFeed = [...prev.getFeed, ...newPosts];
        console.log(updatedFeed);
        
        setOffset(updatedFeed?.length); // update offset only after deduplication
        return {
          getFeed: updatedFeed,
        };
      },
    });
  };


  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center text-red-500 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 backdrop-blur-lg"
    >
      Error loading feed
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {data?.getFeed.map((post) => (
          <Card
            key={post.id}
            className="p-0 mb-4" // Remove padding so Post controls layout
            animate
            hover
          >
            <Post
              post={post}
              onLike={handleLike}
              currentUser={user}
              onCommentClick={handleCommentClick}
            />
          </Card>
        ))}
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </motion.div>
      )}

      {data?.getFeed.length % limit === 0 && data?.getFeed.length !== 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={loadMore}
            className="group relative flex items-center justify-center px-8 py-3 
                     bg-gradient-to-r from-purple-500 to-indigo-500
                     text-white font-medium rounded-xl shadow-lg
                     hover:shadow-xl transform transition-all duration-300
                     hover:scale-[1.02] focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-purple-500"
          >
            Load More
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2"
            >
              →
            </motion.div>
          </button>
        </motion.div>
      )}

      {data?.getFeed.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
            No posts yet
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Start following people or create your first post!
          </p>
        </motion.div>
      )}

      {showCommentModal && selectedPost && (
        <CommentModal
          isOpen={showCommentModal}
          postId={selectedPost.id}
          postAuthor={selectedPost.author}
          postContent={selectedPost.content}
          onClose={handleCloseCommentModal}
        />
      )}
    </motion.div>
  );
};

export default Feed;
