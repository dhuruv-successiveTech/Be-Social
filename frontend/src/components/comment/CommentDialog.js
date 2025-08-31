"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment(
    $postId: ID!
    $content: String!
    $parentCommentId: ID
  ) {
    createComment(
      postId: $postId
      content: $content
      parentCommentId: $parentCommentId
    ) {
      id
    }
  }
`;

const CommentDialog = ({ postId, parentCommentId, onClose }) => {
  const [commentContent, setCommentContent] = useState("");
  const [createComment, { loading, error }] = useMutation(
    CREATE_COMMENT_MUTATION,
    {
      onCompleted: () => {
        setCommentContent("");
        if (onClose) {
          onClose();
        }
      },
      refetchQueries: ["GetPost"],
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createComment({
      variables: {
        postId,
        content: commentContent,
        parentCommentId,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors duration-200 
              bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500'
          }`}
          rows="4"
          placeholder="Write your comment..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit'
          )}
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-red-600 dark:text-red-400 text-sm">
          {error.message}
        </div>
      )}
    </form>
  );
};

export default CommentDialog;
