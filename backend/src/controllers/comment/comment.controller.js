const commentService = require('../../services/comment/comment.service');

const createComment = async (_, { content, postId, parentCommentId }, context) => {
  if (!context.user) {
    throw new Error('Unauthorized: Must be logged in to create a comment');
  }
  const authorId = context.user.id;
  return await commentService.createComment(content, authorId, postId, parentCommentId);
};

const getCommentsByPostId = async (_, { postId }) => {

  return await commentService.getCommentsByPostId(postId);
};

const likeComment = async (_, { commentId }, context) => {
  if (!context.user) {
    throw new Error('Unauthorized: Must be logged in to like a comment');
  }
  const userId = context.user.id;
  return await commentService.likeComment(commentId, userId);
};

const unlikeComment = async (_, { commentId }, context) => {
  if (!context.user) {
    throw new Error('Unauthorized: Must be logged in to unlike a comment');
  }
  const userId = context.user.id;
  return await commentService.unlikeComment(commentId, userId);
};

const deleteComment = async (_, { commentId }, context) => {
  if (!context.user) {
    throw new Error('Unauthorized: Must be logged in to delete a comment');
  }
  const userId = context.user.id;
  return await commentService.deleteComment(commentId, userId);
};

module.exports = {
  createComment,
  getCommentsByPostId,
  likeComment,
  unlikeComment,
  deleteComment,
};
