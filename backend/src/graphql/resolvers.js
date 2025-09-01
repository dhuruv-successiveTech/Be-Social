const { UserInputError, AuthenticationError } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const authController = require('../controllers/auth/auth');
const userService = require('../services/user/user');
const postService = require('../services/post/post');
const chatService = require('../services/chat/chat');
const notificationService = require('../services/notification/notification');
const commentController = require('../controllers/comment/comment');
const { verifyToken } = require('../services/auth/auth');

const pubsub = new PubSub();

const getUserFromReq = (req) => {
  const authHeader = req.headers.authorization.split(" ")[1];
  if (!authHeader) throw new AuthenticationError('Not authenticated');
  return verifyToken(authHeader);
};

const resolvers = {
  Subscription: {
    postLiked: {
      subscribe: () => pubsub.asyncIterator(['POST_LIKED'])
    },
    commentAdded: {
      subscribe: (_, { postId }) => pubsub.asyncIterator(`COMMENT_ADDED:${postId}`)
    },
    postUpdated: {
      subscribe: () => pubsub.asyncIterator('POST_UPDATED')
    },
    postDeleted: {
      subscribe: () => pubsub.asyncIterator('POST_DELETED')
    },
    messageReceived: {
      subscribe: (_, { chatId }) => pubsub.asyncIterator(`CHAT:${chatId}`)
    },
    notificationReceived: {
      subscribe: () => pubsub.asyncIterator('NOTIFICATIONS')
    }
  },
  Query: {
    // Auth & User
    getCurrentUser: async (_, __, { req }) => {
      const decoded = getUserFromReq(req);
      return userService.getUser(decoded.id);
    },
    getUser: async (_, { id }) => userService.getUser(id),
    searchUsers: async (_, { query }) => userService.searchUsers(query),

    // Posts
    getFeed: async (_, { offset = 0, limit = 10 }, { req }) => {
      const decoded = getUserFromReq(req);
      return postService.getFeed(decoded.id, limit, offset);
    },
    getPosts: (_, {offset, limit}) => postService.getPosts(offset, limit),
    getPost: async (_, { id }) => postService.getPost(id),
    getUserPosts: async (_, { userId, offset, limit }) => postService.getUserPosts(userId, limit, offset),
    getMediaPosts: async () => {
      return postService.getMediaPosts();
    },

    // Comments
    getComments: async (_, { postId }) => await commentController.getCommentsByPostId(_, { postId }), // Modified line

    // Chats
    getChats: async (_, __, { req }) => {
      const decoded = getUserFromReq(req);
      return chatService.getChats(decoded.id);
    },
    getChat: async (_, { chatId }, { req }) => {
      const decoded = getUserFromReq(req);
      return chatService.getChat(chatId, decoded.id);
    },

    // Notifications
    getNotifications: async (_, __, { req }) => {
      const decoded = getUserFromReq(req);
      return notificationService.getNotifications(decoded.id);
    },
    getUnreadNotificationCount: async (_, __, { req }) => {
      const decoded = getUserFromReq(req);
      return notificationService.getUnreadNotificationCount(decoded.id);
    },
  },

  Mutation: {
    // Auth
    register: (_, { input }) => authController.register(
      input.username,
      input.email,
      input.password,
      input.name,
    ),
    login: (_, { input }) => authController.login(input.email, input.password),
    refreshToken: async (_, { token }) => authController.refreshToken(token),

    // User
    updateProfile: async (_, { bio, avatar }, { req }) => {
      const decoded = getUserFromReq(req);
      return userService.updateProfile(decoded.id, { bio, avatar });
    },
    followUser: async (_, { userId }, { req }) => {
      const decoded = getUserFromReq(req);
      return userService.followUser(userId, decoded.id);
    },
    unfollowUser: async (_, { userId }, { req }) => {
      const decoded = getUserFromReq(req);
      return userService.unfollowUser(userId, decoded.id);
    },

    // Posts
    createPost: async (_, { content, media = [] }, { req }) => {
      const decoded = getUserFromReq(req);
      return postService.createPost(content, media, decoded.id);
    },
    updatePost: async (_, { postId, content }, { req }) => {
      
      const decoded = getUserFromReq(req);
      console.log("decoded",decoded);
      
      try {
        const post = await postService.getPost(postId);
        if (!post) throw new UserInputError('Post not found');
        if (post.author.id !== decoded.id) throw new AuthenticationError('Not authorized to edit this post');
        
        const updatedPost = await postService.updatePost(postId, content, decoded.id);
        pubsub.publish('POST_UPDATED', { postUpdated: updatedPost });
        return updatedPost;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    deletePost: async (_, { postId }, { req }) => {
      const decoded = getUserFromReq(req);
      try {
        const post = await postService.getPost(postId);
        if (!post) throw new UserInputError('Post not found');
        if (post.author.id !== decoded.id) throw new AuthenticationError('Not authorized to delete this post');
        
        await postService.deletePost(postId);
        pubsub.publish('POST_DELETED', { postDeleted: { id: postId } });
        return { id: postId };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    likePost: async (_, { postId }, { req }) => {
      const decoded = getUserFromReq(req);
      const post = await postService.likePost(postId, decoded.id);

      // Notify post author
      if (post.author.id !== decoded.id) {
        await notificationService.createNotification('like', post.author.id, decoded.id, postId);
      }

      // Publish to subscription for real-time updates
      pubsub.publish('POST_LIKED', { postLiked: post });

      return post;
    },
    unlikePost: async (_, { postId }, { req }) => {
      const decoded = getUserFromReq(req);
      return postService.unlikePost(postId, decoded.id);
    },

    // Comments (New additions)
    createComment: async (_, { postId, content, parentCommentId }, { req }) => {
      const decoded = getUserFromReq(req);
      const comment = await commentController.createComment(_, { content, postId, parentCommentId }, { user: decoded });
      pubsub.publish(`COMMENT_ADDED:${postId}`, { commentAdded: comment });
      return comment;
    },
    deleteComment: async (_, { id }, { req }) => {
      const decoded = getUserFromReq(req);
      return commentController.deleteComment(_, { commentId: id }, { user: decoded });
    },
    likeComment: async (_, { commentId }, { req }) => {
      const decoded = getUserFromReq(req);
      return commentController.likeComment(_, { commentId }, { user: decoded });
    },
    unlikeComment: async (_, { commentId }, { req }) => {
      const decoded = getUserFromReq(req);
      return commentController.unlikeComment(_, { commentId }, { user: decoded });
    },

    // Chat
    createChat: async (_, { participantIds, isGroup, groupName }, { req }) => {
      const decoded = getUserFromReq(req);
      return chatService.createChat(participantIds, isGroup, groupName, decoded.id);
    },
    sendMessage: async (_, { chatId, content }, { req }) => {
      const decoded = getUserFromReq(req);
      const message = await chatService.sendMessage(chatId, content, decoded.id);

      const chat = await chatService.getChat(chatId, decoded.id);
      const recipients = chat.participants.filter(p => p.id !== decoded.id).map(p => p.id);

      await Promise.all(
        recipients.map(recipientId =>
          notificationService.createNotification(
            'message',
            recipientId,
            decoded.id,
            null,
            null,
            chatId
          )
        )
      );

      pubsub.publish(`CHAT:${chatId}`, { messageReceived: message });

      return message;
    },

    // Notifications
    markNotificationAsRead: async (_, { id }, { req }) => {
      const decoded = getUserFromReq(req);
      return notificationService.markAsRead(id, decoded.id);
    },
  }
};

module.exports = resolvers;