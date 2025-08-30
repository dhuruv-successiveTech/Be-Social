const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, {
  timestamps: true,
});

// Add indexes for better query performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

commentSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

commentSchema.set('toJSON', {
  virtuals: true,
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
