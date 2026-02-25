const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  type: {
    type: String,
    enum: ['client-to-announcer', 'announcer-to-client']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    // Client → Announcer criteria
    service: Number,
    punctuality: Number,
    communication: Number,
    hygiene: Number,
    // Announcer → Client criteria
    respect: Number,
    tidiness: Number
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  response: {
    content: String,
    createdAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
