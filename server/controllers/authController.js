const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is undefined');
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, age, gender } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor proporciona nombre, email y contraseña' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // SECURITY: Only allow 'user' or 'announcer' roles on registration
    const safeRole = (role === 'announcer') ? 'announcer' : 'user';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      phone,
      age: age ? Number(age) : undefined,
      gender: gender || undefined
    });

    logger('activity', `Nuevo usuario registrado: ${user.email} con rol ${user.role}`);

    // Fetch the full user document (minus password) so the client gets all fields
    const fullUser = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: fullUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    // Check if password matches (if user exists)
    const isMatch = user ? await user.matchPassword(password) : false;

    if (!user || !isMatch) {
      // SECURITY: Uniform error message to prevent user enumeration
      return res.status(401).json({ success: false, error: 'Correo electrónico o contraseña incorrectos' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' });
    }

    logger('activity', `Sesión iniciada: ${user.email}`);

    // Fetch the full user document (minus password) so the client gets all fields (wallet, priceList, etc.)
    const fullUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: fullUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+priceList.content');

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Check if premium subscription has expired
    if (user.premium && user.premiumUntil && new Date() > new Date(user.premiumUntil)) {
      user.premium = false;
      user.premiumPlan = 'none';
      user.isVip = false;
      user.diamondBoosts = 0;
      await user.save();
    }

    // Repair existing users: Initialize diamondBoosts if Diamond and undefined/null/0 (one-time fix for existing users)
    if (user.premiumPlan === 'diamond' && (user.diamondBoosts === undefined || user.diamondBoosts === null || user.diamondBoosts === 0)) {
      user.diamondBoosts = 5;
      await user.save();
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    // Only allow these fields to be updated by the user
    // CRITICAL SECURITY: Never allow 'role', 'wallet', 'premium', 'isVip', or 'diamondBoosts' here
    const allowedFields = [
      'name', 'displayName', 'phone',
      'bio', 'languages', 'location', 'age',
      'gender', 'avatar', 'priceList', 'paymentMethods'
    ];

    const fieldsToUpdate = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password +priceList.content');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, error: 'Password is incorrect' });
    }

    // Validate new password length
    if (!req.body.newPassword || req.body.newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    user.password = req.body.newPassword;
    await user.save();

    logger('activity', `Contraseña actualizada por el usuario: ${user.email}`);

    res.status(200).json({
      success: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update last seen timestamp
// @route   POST /api/auth/heartbeat
// @access  Private
exports.heartbeat = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await User.findByIdAndUpdate(userId, { lastSeen: Date.now() });
    res.status(200).json({ success: true });
  } catch (error) {
    logger('error', `Heartbeat error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};
