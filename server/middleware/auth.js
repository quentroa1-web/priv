const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Your account has been banned' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Check if user is admin
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin only.'
    });
  }
};

// Check if user is announcer
exports.announcerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'announcer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Announcers only.'
    });
  }
};

// Check if user is admin or announcer
exports.adminOrAnnouncer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'announcer')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied.'
    });
  }
};
