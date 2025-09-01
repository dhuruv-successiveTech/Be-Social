const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type DeletePostResponse {
    id: ID!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    bio: String
    avatar: String
    followers: [User]
    following: [User]
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: ID!
    content: String!
    media: [String]
    author: User!
    likes: [User]
    comments: [Comment]
    shares: [User]
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    likes: [User]
    parentComment: Comment
    replies: [Comment]
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: ID!
    sender: User!
    content: String!
    read: [User]
    createdAt: String!
  }

  type Subscription {
    postLiked: Post
    commentAdded(postId: ID!): Comment
    postUpdated: Post!
    postDeleted: DeletePostResponse!
  }

  type Chat {
    id: ID!
    participants: [User!]!
    messages: [Message]
    isGroupChat: Boolean!
    groupName: String
    groupAdmin: User
    createdAt: String!
    updatedAt: String!
  }

  type Notification {
    id: ID!
    recipient: User!
    sender: User!
    type: String!
    post: Post
    comment: Comment
    chat: Chat
    read: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type DeletePostResponse {
    id: ID!
  }

  type Query {
    getUser(id: ID!): User!
    getCurrentUser: User!
    searchUsers(query: String!): [User]!
    getFeed(offset: Int, limit: Int): [Post]!
    getPost(id: ID!): Post!
    getPosts(offset: Int, limit: Int): [Post]!
    getUserPosts(userId: ID!, offset: Int, limit: Int): [Post]!
    getMediaPosts: [Post]!
    getComments(postId: ID!): [Comment]!
    getChats: [Chat]!
    getChat(chatId: ID!): Chat!
    getNotifications: [Notification]!
    getUnreadNotificationCount: Int!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    updateProfile(bio: String, avatar: String): User!
    followUser(userId: ID!): User!
    unfollowUser(userId: ID!): User!
    createPost(content: String!, media: [String]): Post!
    updatePost(postId: ID!, content: String!): Post!
    deletePost(postId: ID!): DeletePostResponse!
    likePost(postId: ID!): Post!
    unlikePost(postId: ID!): Post!
    createComment(postId: ID!, content: String!, parentCommentId: ID): Comment!
    deleteComment(id: ID!): Boolean!
    likeComment(commentId: ID!): Comment!
    unlikeComment(commentId: ID!): Comment!
    createChat(participantIds: [ID!]!, isGroup: Boolean, groupName: String): Chat!
    sendMessage(chatId: ID!, content: String!): Message!
    markNotificationAsRead(id: ID!): Notification!
  }

  type Subscription {
    messageReceived(chatId: ID!): Message!
    notificationReceived: Notification!
    postLiked(postId: ID!): Post!
    commentAdded(postId: ID!): Comment!
  }
`;

module.exports = typeDefs;