const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['mujer', 'hombre', 'trans', 'gigolo', 'woman', 'man', 'transgender'],
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  phone: String,
  whatsapp: String,
  location: {
    department: String,
    city: String,
    neighborhood: String,
    specificZone: String,
    placeType: [String]
  },
  services: [String],
  customServices: [String],
  pricing: [{
    label: String,
    price: Number,
    priceType: {
      type: String,
      enum: ['hora', 'sesion', 'noche', 'negociable', 'service'],
      default: 'hora'
    }
  }],
  attendsTo: [{
    type: String,
    enum: ['hombres', 'mujeres', 'parejas', 'todos']
  }],
  availability: {
    days: [{
      type: String,
      enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    }],
    hours: {
      start: String,
      end: String
    }
  },
  photos: [{
    url: String,
    isMain: Boolean
  }],
  plan: {
    type: String,
    enum: ['free', 'gold', 'diamond', 'gratis', 'premium', 'vip'], // Kept old ones for compatibility
    default: 'free'
  },
  priority: {
    type: Number,
    default: 1 // 1: Free, 2: Gold, 3: Diamond
  },
  lastBumpDate: {
    type: Date,
    default: Date.now
  },
  isBoosted: {
    type: Boolean,
    default: false
  },
  boostedUntil: {
    type: Date
  },
  lastBoostDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});

module.exports = mongoose.model('Ad', AdSchema);
