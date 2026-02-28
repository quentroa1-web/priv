const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Message content cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'media'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  unlockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance on frequent queries
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Message', MessageSchema);
