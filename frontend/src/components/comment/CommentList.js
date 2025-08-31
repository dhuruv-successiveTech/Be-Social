"use client";

import { useQuery, useSubscription } from "@apollo/client/react";
import { GET_USER_POSTS } from "../../graphql/queries/getUserPosts";

import { COMMENT_ADDED_SUBSCRIPTION } from "../../graphql/subscriptions";
import { useState } from "react";
import CommentDialog from "./CommentDialog";
import { GET_COMMENTS } from "../../graphql/queries/getComments";

const CommentList = ({ postId }) => {
  const { data, loading, error } = useQuery(GET_COMMENTS, {
    variables: { postId: postId },
  });

  useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
    variables: { postId },
    onSubscriptionData: ({ client, subscriptionData }) => {
      const newComment = subscriptionData.data.commentAdded;
      const existingPost = client.readQuery({
        query: GET_USER_POSTS,
        variables: { id: postId },
      });

      if (existingPost && newComment) {
        client.writeQuery({
          query: GET_USER_POSTS,
          variables: { id: postId },
          data: {
            getPost: {
              ...existingPost.getPost,
              comments: [...existingPost.getPost.comments, newComment],
            },
          },
        });
      }
    },
  });

  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [parentCommentId, setParentCommentId] = useState(null);

  const handleReplyClick = (commentId) => {
    setParentCommentId(commentId);
    setShowReplyDialog(true);
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error loading comments.</div>;


const comments = data?.getComments
  return (
    <div className="space-y-4">
      {comments?.map((comment, index) => (
        <div key={index} className="flex items-start space-x-3">
          <img
            src={comment.author.avatar || "https://via.placeholder.com/32"}
            alt={comment.author.username}
            className="w-8 h-8 rounded-full ring-2 ring-indigo-500/10"
          />
          <div className="flex-1">
            <div className={` bg-gray-700/50 rounded-lg p-3`}>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold cursor-pointer transition-colors text-gray-100 hover:text-indigo-400
                `}>
                  {comment.author.username}
                </span>
                <span className={`text-xs 'text-gray-400'`}>
                  {new Date(parseInt(comment.createdAt)).toLocaleDateString()}
                </span>
              </div>
              <p className={`text-sm mt-1 text-gray-300`}>{comment.content}</p>
            </div>
            <div className="flex items-center space-x-4 mt-1 pl-2">
              <button
                onClick={() => handleReplyClick(comment.id)}
                className={`text-xs flex items-center space-x-1 transition-colors text-gray-400 hover:text-indigo-400`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Reply</span>
              </button>
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <div className={`ml-6 mt-2 space-y-2 border-l-2 border-gray-700`}>
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="flex items-start space-x-3 pl-4"
                  >
                    <img
                      src={reply.author.avatar || "https://via.placeholder.com/32"}
                      alt={reply.author.username}
                      className="w-6 h-6 rounded-full ring-2 ring-indigo-500/10"
                    />
                    <div className="flex-1">
                      <div className={`bg-gray-700/50 rounded-lg p-3`}>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold cursor-pointer transition-colors text-gray-100 hover:text-indigo-400}`}>
                            {reply.author.username}
                          </span>
                          <span className={`text-xs text-gray-400`}>
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 text-gray-300`}>{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      {showReplyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4`}>
            <CommentDialog
              postId={postId}
              parentCommentId={parentCommentId}
              onClose={() => setShowReplyDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentList;