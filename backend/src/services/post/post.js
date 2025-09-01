const Post = require('../../models/post/post');
const User = require('../../models/user/user');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const postService = {
  async createPost(content, media, userId) {
    const post = await Post.create({
      content,
      media: media || [],
      author: userId,
    });

    return post.populate('author');
  },

  async getPosts(limit = 10, offset = 0) {
    const posts = await Post.find()
      .sort({ createdAt: -1, _id: -1 }) // Stable sort
      .skip(offset)
      .limit(limit)
      .populate('author')
      .populate('comments')
      .populate('likes');

    return posts;
  },

  async getFeed(userId, limit = 10, offset = 0) {

    const user = await User.findById(userId).select('following');
    
    const posts = await Post.find({
      $or: [
        { author: { $in: [...user.following, userId] } },
      ],
    })
      .sort({ createdAt: -1, _id: -1 }) 
      .skip(offset)
      .limit(limit)
      .populate('author')
      .populate('likes');
    
    // console.log('[getFeed] offset:', offset, 'limit:', limit, 'returned post IDs:', posts.map(p => p._id.toString()));

    return posts;
  },

  async getPost(postId) {
  
    const post = await Post.findById(postId)
      .populate('author')
      .populate('comments')
      .populate('likes');
    if (!post) {
      throw new UserInputError('Post not found');
    }

    return post;
  },

  async getUserPosts(userId, limit = 10, offset = 0) {
 
    const user = await User.findById(userId);
    if (!user) {
      throw new UserInputError('User not found');
    }
 
    
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('author')
      .populate('likes')
      
    return posts;
  },

  async likePost(postId, userId) {
    const post = await Post.findById(postId);
    
    if (!post) {
      throw new UserInputError('Post not found');
    }

    if (post.likes.includes(userId)) {
      throw new UserInputError('Post already liked');
    }

    post.likes.push(userId);
    await post.save();

    return post.populate('author likes');
  },

  async unlikePost(postId, userId) {
    const post = await Post.findById(postId);
    
    if (!post) {
      throw new UserInputError('Post not found');
    }

    if (!post.likes.includes(userId)) {
      throw new UserInputError('Post not liked');
    }

    post.likes = post.likes.filter(like => like.toString() !== userId.toString());
    await post.save();

    return post.populate('author likes');
  },

  async getMediaPosts() {
    const posts = await Post.find({
      media: { $exists: true, $ne: [] }
    })
      .sort({ createdAt: -1 })
      .populate('author')
      .exec();
  
    return posts;
  },

  async deletePost(postId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new UserInputError('Post not found');
    }

    await Post.findByIdAndDelete(postId);
    return { id: postId };
  },

  async updatePost(postId, content, userId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new UserInputError('Post not found');
    }

    if (post.author.toString() !== userId.toString()) {
      throw new AuthenticationError('Not authorized to update this post');
    }

    post.content = content;
    await post.save();

    return post.populate('author');
  },
};

module.exports = postService;
