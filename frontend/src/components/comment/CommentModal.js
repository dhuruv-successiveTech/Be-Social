'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_COMMENTS } from '../../graphql/queries/getComment';
import { gql } from '@apollo/client';
import Image from 'next/image';

const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $content: String!, $parentCommentId: ID) {
    createComment(postId: $postId, content: $content, parentCommentId: $parentCommentId) {
      id
      content
      createdAt
      author {
        id
        username
        avatar
      }
      likes {
        id
      }
      replies {
        id
      }
    }
  }
`;

const CommentModal = ({ postId, isOpen, onClose, postAuthor, postContent }) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const { data, loading: commentsLoading } = useQuery(GET_COMMENTS, {
    variables: { postId },
    skip: !isOpen
  });

  const [createComment, { loading: submitting }] = useMutation(CREATE_COMMENT, {
    update: (cache, { data: { createComment } }) => {
      // Update the comments list in the cache
      const existingComments = cache.readQuery({
        query: GET_COMMENTS,
        variables: { postId }
      });

      if (existingComments) {
        cache.writeQuery({
          query: GET_COMMENTS,
          variables: { postId },
          data: {
            getComments: [...existingComments.getComments, createComment]
          }
        });
      }

      // Update the comment count in the Feed
      cache.modify({
        id: cache.identify({ __typename: 'Post', id: postId }),
        fields: {
          comments(existingComments = []) {
            const newCommentRef = cache.writeFragment({
              data: createComment,
              fragment: gql`
                fragment NewComment on Comment {
                  id
                }
              `
            });
            return [...existingComments, newCommentRef];
          }
        }
      });
    },
    refetchQueries: [
      { query: GET_COMMENTS, variables: { postId } }
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await createComment({
        variables: {
          postId,
          content: comment,
          parentCommentId: replyTo
        }
      });
      setComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  if (!isOpen) return null;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(parseInt(date))) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    return `${Math.floor(months / 12)}y`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-gray-800 rounded-lg w-full max-w-lg mx-4 overflow-hidden`}>
        {/* Header */}
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h2 className={`font-semibold text-white`}>Comments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Original Post */}
        <div className={`px-4 py-3 border-b border-gray-700`}>
          <div className="flex items-start space-x-3">
            <Image
              src={postAuthor.avatar || "https://via.placeholder.com/40"}
              alt={postAuthor.username}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-sm">{postAuthor.username}</p>
              <p className={`text-sm text-gray-300`}>{postContent}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-h-[400px] overflow-y-auto">
          {commentsLoading ? (
            <div className="p-4 text-center">Loading comments...</div>
          ) : (
            data?.getComments.map((comment) => (
              <div key={comment.id} className={`px-4 py-3 border-b border-gray-700`}>
                <div className="flex items-start space-x-3">
                  <Image
                    src={comment.author.avatar || "https://via.placeholder.com/40"}
                    alt={comment.author.username}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{comment.author.username}</span>
                      <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className={`text-sm text-gray-300`}>{comment.content}</p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <button 
                        onClick={() => setReplyTo(comment.id)}
                        className="hover:text-gray-700"
                      >
                        Reply
                      </button>
                      <span>{comment.likes.length} likes</span>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-2">
                            <Image
                              src={reply.author.avatar || "https://via.placeholder.com/40"}
                              alt={reply.author.username}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">{reply.author.username}</span>
                                <span className="text-xs text-gray-500">{timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className={`text-sm text-gray-300`}>{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className={`p-4 border-t border-gray-700`}>
          {replyTo && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-blue-500">
                Replying to comment
              </span>
              <button 
                onClick={() => setReplyTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className={`flex-1 rounded-full px-4 py-2 text-sm bg-gray-700 text-gray-100`}
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                submitting || !comment.trim()
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
