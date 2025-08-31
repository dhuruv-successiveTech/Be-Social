"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { formatDistance } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import CommentList from "../comment/CommentList";
import toast from "react-hot-toast";
import { UPDATE_POST, DELETE_POST } from "../../graphql/mutations/postMutations";
import { ADD_COMMENT } from "../../graphql/mutations/commentMutations";
import Spinner from "../shared/Spinner";
import ShareModal from "./ShareModal";
import { gql } from "@apollo/client";
import { FiHeart, FiMessageSquare, FiShare2, FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

const Post = ({ post, onLike, currentUser, onPostDelete, onPostUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const menuRef = useRef(null);
  const hasLiked = post.likes?.some(like => like.id === currentUser?.id);
  const isAuthor = post.author.id === currentUser?.id;

  const [updatePost] = useMutation(UPDATE_POST);
  const [deletePost] = useMutation(DELETE_POST);
  const [addComment] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setNewComment('');
      setIsSubmittingComment(false);
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      setIsSubmittingComment(false);
      toast.error('Failed to add comment. Please try again.');
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePost({
        variables: {
          postId: post.id,
          content: editContent
        }
      });
      setIsEditing(false);
      if (onPostUpdate) onPostUpdate();
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost({
        variables: {
          postId: post.id
        }
      });
      if (onPostDelete) onPostDelete(post.id);
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment({
        variables: {
          postId: post.id,
          content: newComment.trim()
        },
        update: (cache, { data: { createComment } }) => {
          cache.modify({
            id: cache.identify(post),
            fields: {
              comments(existingComments = []) {
                const newCommentRef = cache.writeFragment({
                  data: createComment,
                  fragment: gql`
                    fragment NewComment on Comment {
                      id
                      content
                      createdAt
                      author {
                        id
                        username
                        avatar
                      }
                    }
                  `
                });
                return [...existingComments, newCommentRef];
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

    const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(parseInt(timestamp));
      return formatDistance(date, new Date(), { addSuffix: true, includeSeconds: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'some time ago';
    }
  };  return (
    <div 
      className={`rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 p-6 mb-4
       bg-gray-800 hover:bg-gray-750 border border-gray-700`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={post.author.avatar || "https://via.placeholder.com/40"}
            alt={post.author.username}
            className={`w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400/20 bg-gray-700`}
          />
          <div>
            <span className="font-semibold hover:text-indigo-500 transition-colors cursor-pointer">
              {post.author.username}
            </span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
         
              {formatTimestamp(post.createdAt)}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mt-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="4"
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed mt-4">{post.content}</p>
      )}
      {post.media && post.media.length > 0 && (
        <div className="mt-4">
          <div className={`grid ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {post.media.map((url, index) => {
              const isVideo = url.match(/\.(mp4|mov|avi|webm)$/) || 
                              url.includes('/video/upload/') ||
                              url.includes('resource_type=video');
              
              const mediaClass = post.media.length === 1 
                ? "rounded-lg w-full h-[500px] object-scale-down mx-auto"
                : "rounded-lg w-full h-[300px] object-cover";

              return isVideo ? (
                <video
                  key={index}
                  src={url}
                  controls
                  className={mediaClass}
                  preload="metadata"
                />
              ) : (
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className={mediaClass}
                />
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-6 flex items-center justify-between border-t dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => onLike(post.id, hasLiked)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill={hasLiked ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span>{post.likes?.length || 0} likes</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments.length} comments</span>
          </button>
        </div>
        <button 
          onClick={() => setShowShareModal(true)}
          className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          aria-label="Share post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        
        {/* Share Modal */}
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            post={post}
          />
        )}
      </div>
      {showComments && (
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              rows="2"
              disabled={isSubmittingComment}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  !newComment.trim() || isSubmittingComment
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {isSubmittingComment ? (
                  <>
                    <Spinner size="sm" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post Comment</span>
                )}
              </button>
            </div>
          </div>
          <CommentList postId={post.id} />
        </div>
      )}
    </div>
  );
};

export default Post;
