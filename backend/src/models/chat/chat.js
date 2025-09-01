const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  read: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  messages: [messageSchema],
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
    required: function() {
      return this.isGroupChat;
    },
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isGroupChat;
    },
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ 'messages.createdAt': -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
