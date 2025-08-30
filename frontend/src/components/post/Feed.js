"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription, useApolloClient } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../../hooks/useAuth";
import CommentModal from "../comment/CommentModal";
import { POST_LIKED_SUBSCRIPTION } from "../../graphql/subscriptions";
import Post from "./Post";

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

// const Post = ({ post, onLike, currentUser, onCommentClick }) => {
//   // Added onCommentClick prop
//   const timeAgo = (date) => {
//     const timestamp = typeof date === "string" ? parseInt(date) : date; // Ensure it's a number
//     const now = Date.now();
//     const seconds = Math.floor((now - timestamp) / 1000);

//     if (seconds < 60) return `${seconds}s ago`;

//     const minutes = Math.floor(seconds / 60);
//     if (minutes < 60) return `${minutes}m ago`;

//     const hours = Math.floor(minutes / 60);
//     if (hours < 24) return `${hours}h ago`;

//     const days = Math.floor(hours / 24);
//     if (days < 30) return `${days}d ago`;

//     const months = Math.floor(days / 30);
//     if (months < 12) return `${months}mo ago`;

//     const years = Math.floor(months / 12);
//     return `${years}y ago`;
//   };

//   const hasLiked = post.likes.some((like) => like.id === currentUser?.id);

//   return (
//     <div className="bg-white shadow rounded-lg mb-4 p-4">
//       <div className="flex items-center mb-4">
//         <img
//           src={post.author.avatar || "https://via.placeholder.com/40"}
//           alt={post.author.username}
//           className="w-10 h-10 rounded-full mr-3"
//         />
//         <div>
//           <Link href={`/profile/${post.author.id}`}>
//             <span className="font-semibold text-gray-900">
//               {post.author.username}
//             </span>
//           </Link>
//           <p className="text-gray-500 text-sm">{timeAgo(post.createdAt)}</p>
//         </div>
//       </div>
//       <p className="text-gray-800 mb-4">{post.content}</p>
//       {console.log("pst",post)}
      
//       {post.media && post.media.length > 0 && (
//         <div className="mb-4">
//           {post.media.map((url, index) => {
//             const isVideo = url.match(/\.(mp4|mov|avi|webm)$/) || 
//                           url.includes('/video/upload/') ||
//                           url.includes('resource_type=video');
            
//             return isVideo ? (
//               <video
//                 key={index}
//                 src={url}
//                 controls
//                 className="rounded-lg max-h-96 w-full"
//                 preload="metadata"
//               />
//             ) : (
//               <img
//                 key={index}
//                 src={url}
//                 alt={`Media ${index + 1}`}
//                 className="rounded-lg max-h-96 w-full object-cover"
//               />
//             );
//           })}
//         </div>
//       )}
//       <div className="flex items-center space-x-4">
//         <button
//           onClick={() => onLike(post.id, hasLiked)}
//           className="flex items-center text-gray-500 hover:text-blue-600"
//         >
//           <svg
//             className="h-5 w-5 mr-1"
//             fill={hasLiked ? "currentColor" : "none"}
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//             />
//           </svg>
//           <span>{post?.likes.length}</span>
//         </button>
//         <button
//           onClick={() => onCommentClick(post.id)} // Changed Link to button and added onClick
//           className="flex items-center text-gray-500 hover:text-blue-600"
//         >
//           <svg
//             className="h-5 w-5 mr-1"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//             />
//           </svg>
//           <span>{post.comments.length}</span>
//         </button>
//       </div>
//     </div>
//   );
// };

const Feed = () => {
  const { user } = useAuth();
  const limit = 10;
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
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

  const { loading, error, data, fetchMore } = useQuery(GET_FEED, {
    variables: { offset: 0, limit },
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
    console.log(postId);
    
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
        offset: data.getFeed.length,
        limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const existingIds = new Set(prev.getFeed.map((p) => p.id));
        const newPosts = fetchMoreResult.getFeed.filter(
          (p) => !existingIds.has(p.id)
        );

        return {
          getFeed: [...prev.getFeed, ...newPosts],
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
        {data?.getFeed.map((post, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <Post
              post={post}
              onLike={handleLike}
              currentUser={user}
              onCommentClick={handleCommentClick}
            />
          </motion.div>
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
