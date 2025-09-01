const Comment = require("../../models/comment/comment");
const Post = require("../../models/post/post");

const createComment = async (
  content,
  authorId,
  postId,
  parentCommentId = null
) => {
  try {
 
    
    const newComment = new Comment({
      content,
      author: authorId,
      post: postId,
      parentComment: parentCommentId,
    }); 
    

    await newComment.save();

    // Update the post with the new comment
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id },
    });
    
    // If it's a reply, update the parent comment
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: newComment._id },
      });
    }

    return newComment.populate("author");
  } catch (error) {
    throw new Error(`Error creating comment: ${error.message}`);
  }
};

const getCommentsByPostId = async (postId) => {
  try {
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate({
        path: "author",
        populate: ["followers", "following"],
      })
      .populate({
        path: "replies",
        populate: {
          path: "author",
        },
      })
      .populate("post")
      .populate("likes")
      .sort({ createdAt: -1 })
      

    return comments;
  } catch (error) {
    throw new Error(`Error fetching comments: ${error.message}`);
  }
};

const likeComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.likes.includes(userId)) {
      throw new Error("Comment already liked by this user");
    }

    comment.likes.push(userId);
    await comment.save();
    return comment;
  } catch (error) {
    throw new Error(`Error liking comment: ${error.message}`);
  }
};

const unlikeComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (!comment.likes.includes(userId)) {
      throw new Error("Comment not liked by this user");
    }

    comment.likes = comment.likes.filter(
      (like) => like.toString() !== userId.toString()
    );
    await comment.save();
    return comment;
  } catch (error) {
    throw new Error(`Error unliking comment: ${error.message}`);
  }
};

const deleteComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.author.toString() !== userId.toString()) {
      throw new Error("Unauthorized to delete this comment");
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // If it's a reply, remove from parent comment's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    await comment.deleteOne();
    return { message: "Comment deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting comment: ${error.message}`);
  }
};

module.exports = {
  createComment,
  getCommentsByPostId,
  likeComment,
  unlikeComment,
  deleteComment,
};
