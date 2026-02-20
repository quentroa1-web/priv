const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requestVerification, getUsers } = require('../controllers/userController');
const { uploadDocs } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name displayName avatar bio languages location age gender lastSeen verified role premium isOnline');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get users list
// @route   GET /api/users
// @access  Public
router.get('/', getUsers);

// @desc    Request verification
// @route   POST /api/users/verify
// @access  Private
const uploadFields = uploadDocs.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'photoProof', maxCount: 1 }
]);
router.post('/verify', protect, uploadFields, requestVerification);

module.exports = router;
