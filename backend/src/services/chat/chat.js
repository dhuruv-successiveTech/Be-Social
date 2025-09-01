const Chat = require('../../models/chat/chat');
const User = require('../../models/user/user');
const { UserInputError, AuthenticationError } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const chatService = {
  async createChat(participantIds, isGroup = false, groupName = null, userId) {
    // Verify all participants exist
    const participants = await User.find({ _id: { $in: participantIds } });
    
    if (participants.length !== participantIds.length) {
      throw new UserInputError('One or more participants not found');
    }

    // For direct messages, check if chat already exists
    if (!isGroup && participantIds.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: participantIds },
      });

      if (existingChat) {
        return existingChat.populate('participants messages.sender');
      }
    }

    const chat = await Chat.create({
      participants: participantIds,
      isGroupChat: isGroup,
      groupName: isGroup ? groupName : undefined,
      groupAdmin: isGroup ? userId : undefined,
    });

    return chat.populate('participants');
  },

  async getChats(userId) {
    const chats = await Chat.find({ participants: userId })
      .populate('participants')
      .populate('messages.sender')
      .sort({ updatedAt: -1 });

    return chats;
  },

  async getChat(chatId, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    })
      .populate('participants')
      .populate('messages.sender');

    if (!chat) {
      throw new UserInputError('Chat not found');
    }

    return chat;
  },

  async sendMessage(chatId, content, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      throw new UserInputError('Chat not found');
    }

    const message = {
      sender: userId,
      content,
      read: [userId],
    };

    chat.messages.push(message);
    await chat.save();

    const populatedChat = await chat.populate('messages.sender');
    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    // Publish message to subscribers
    pubsub.publish(`CHAT:${chatId}`, {
      messageReceived: newMessage,
    });

    return newMessage;
  },

  async markMessageAsRead(messageId, chatId, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      throw new UserInputError('Chat not found');
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      throw new UserInputError('Message not found');
    }

    if (!message.read.includes(userId)) {
      message.read.push(userId);
      await chat.save();
    }

    return message;
  },

  // For group chats
  async addParticipants(chatId, participantIds, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      groupAdmin: userId,
    });

    if (!chat) {
      throw new UserInputError('Chat not found or not authorized');
    }

    if (!chat.isGroupChat) {
      throw new UserInputError('Cannot add participants to non-group chat');
    }

    const newParticipants = await User.find({ _id: { $in: participantIds } });
    
    if (newParticipants.length !== participantIds.length) {
      throw new UserInputError('One or more participants not found');
    }

    chat.participants = [...new Set([...chat.participants, ...participantIds])];
    await chat.save();

    return chat.populate('participants');
  },

  async removeParticipant(chatId, participantId, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      groupAdmin: userId,
    });

    if (!chat) {
      throw new UserInputError('Chat not found or not authorized');
    }

    if (!chat.isGroupChat) {
      throw new UserInputError('Cannot remove participants from non-group chat');
    }

    if (participantId === userId) {
      throw new UserInputError('Cannot remove yourself as admin');
    }

    chat.participants = chat.participants.filter(
      p => p.toString() !== participantId.toString()
    );
    await chat.save();

    return chat.populate('participants');
  },
};

module.exports = chatService;
