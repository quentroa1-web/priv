const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [50, 'Display name cannot be more than 50 characters']
  },
  gender: {
    type: String,
    enum: ['woman', 'man', 'transgender', 'gigolo', 'other'],
    required: [true, 'Please select a gender']
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    required: [true, 'Please enter your age']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'announcer', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false
  },
  phone: String,
  avatar: String,
  bio: String,
  languages: [String],
  location: {
    type: mongoose.Schema.Types.Mixed
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  idVerified: {
    type: Boolean,
    default: false
  },
  photoVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  },
  isVip: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: String,
    default: '15 min'
  },
  premium: {
    type: Boolean,
    default: false
  },
  premiumPlan: {
    type: String,
    enum: ['none', 'gold', 'diamond'],
    default: 'none'
  },
  premiumUntil: Date,
  diamondBoosts: {
    type: Number
  },
  wallet: {
    coins: {
      type: Number,
      default: 0,
      min: 0,
      select: false
    }
  },
  verificationRequests: {
    idProof: String,
    photoProof: String,
    status: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    requestedAt: Date,
    reviewedAt: Date,
    rejectionReason: String
  },
  priceList: [{
    label: String,
    price: Number,
    description: String,
    type: {
      type: String,
      enum: ['photos', 'videos', 'service'],
      default: 'service'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    content: {
      type: [String],
      select: false
    } // URLs of the files to be delivered automatically, hidden from public queries
  }],
  paymentMethods: [{
    type: { type: String },
    details: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordChangedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for online based on lastSeen (active in last 3 minutes)
UserSchema.virtual('online').get(function () {
  if (!this.lastSeen) return false;
  // 3 minutes threshold
  return new Date() - new Date(this.lastSeen) < 3 * 60 * 1000;
});

// Alias isOnline to online for compatibility
UserSchema.virtual('isOnline').get(function () {
  return this.online;
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
