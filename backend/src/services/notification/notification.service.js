const Notification = require('../../models/notification/notification.model');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const notificationService = {
  async createNotification(type, recipientId, senderId, postId = null, commentId = null, chatId = null) {
    const notification = await Notification.create({
      type,
      recipient: recipientId,
      sender: senderId,
      post: postId,
      comment: commentId,
      chat: chatId,
    });

    const populatedNotification = await notification.populate([
      'sender',
      'post',
      'comment',
      'chat',
    ]);

    // Publish notification to subscriber
    pubsub.publish('NOTIFICATIONS', {
      notificationReceived: populatedNotification,
    });

    return populatedNotification;
  },

  async getNotifications(userId) {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender')
      .populate('post')
      .populate('comment')
      .populate('chat');

    return notifications;
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();

    return notification.populate([
      'sender',
      'post',
      'comment',
      'chat',
    ]);
  },

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    return true;
  },

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.remove();
    return true;
  },
};

module.exports = notificationService;
