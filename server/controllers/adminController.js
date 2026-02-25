const User = require('../models/User');
const Ad = require('../models/Ad');
const Message = require('../models/Message');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user (ban, verify, role)
// @route   PUT /api/admin/users/:id
exports.updateUserAdmin = async (req, res) => {
  try {
    const allowedUpdates = ['role', 'status', 'verified', 'idVerified', 'photoVerified', 'premium', 'isVip', 'premiumUntil', 'diamondBoosts'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all ads
// @route   GET /api/admin/ads
exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: ads.length, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify/Approve Ad
// @route   PUT /api/admin/ads/:id/verify
exports.verifyAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!ad) return res.status(404).json({ success: false, error: 'Ad not found' });
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Verification Requests
// @route   GET /api/admin/verifications
exports.getVerifications = async (req, res) => {
  try {
    const users = await User.find({ 'verificationRequests.status': 'pending' });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Handle Verification Request
// @route   PUT /api/admin/verifications/:id
exports.handleVerification = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updates = {
      'verificationRequests.status': status,
      'verificationRequests.reviewedAt': Date.now(),
      'verificationRequests.rejectionReason': rejectionReason
    };

    if (status === 'approved') {
      updates.verified = true;
      updates.idVerified = true;
      updates.photoVerified = true;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all payments (Transactions)
// @route   GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    // Fetch pending transactions first, then others
    const transactions = await Transaction.find({
      type: { $in: ['deposit', 'subscription', 'withdrawal'] }
    })
      .populate('user', 'name email')
      .sort({ status: -1, createdAt: -1 }); // Pending first (p > c > f) if alphabetical, actually manually sorting might be better but this is ok for now.

    // Custom sort to put pending first
    const sorted = transactions.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve/Reject payment (Transaction)
// @route   PUT /api/admin/payments/:id
exports.handlePayment = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });

    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Transaction already processed' });
    }

    transaction.status = status === 'approved' ? 'completed' : status;
    if (status === 'rejected' && rejectionReason) {
      transaction.rejectionReason = rejectionReason;
    }

    await transaction.save();

    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (status === 'approved') {
      if (transaction.type === 'subscription') {
        user.premium = true;
        user.premiumPlan = transaction.planDetails?.plan || 'gold';

        // Add 30 days (or usage period)
        const months = transaction.planDetails?.months || 1;
        const currentExpiry = user.premiumUntil && user.premiumUntil > Date.now() ? new Date(user.premiumUntil) : new Date();
        currentExpiry.setDate(currentExpiry.getDate() + (30 * months));
        user.premiumUntil = currentExpiry;
      } else if (transaction.type === 'deposit') {
        if (!user.wallet) user.wallet = { coins: 0 };
        user.wallet.coins += (transaction.coinsAmount || 0);
      }

      await user.save();

      // Grant Diamond benefits if applicable (Repair initialization for existing users handled in getMe, but good to have here too)
      if (transaction.type === 'subscription' && (transaction.planDetails?.plan === 'diamond' || user.premiumPlan === 'diamond')) {
        user.diamondBoosts = 5;
        await user.save();
      }

      // Send System Notification to User
      try {
        const systemAdmin = await User.findOne({ email: 'admin@safeconnect.com' });
        if (systemAdmin) {
          let notificationContent = '';
          if (transaction.type === 'subscription') {
            notificationContent = `✅ Su plan ${user.premiumPlan.toUpperCase()} ha sido activado con éxito. ¡Disfrute de los beneficios!`;
          } else if (transaction.type === 'deposit') {
            notificationContent = `💰 Se han acreditado ${transaction.coinsAmount} monedas a su cuenta. Su nuevo saldo es de ${user.wallet.coins} monedas.`;
          }

          if (notificationContent) {
            await Message.create({
              sender: systemAdmin._id,
              recipient: user._id,
              content: notificationContent,
              isSystem: true
            });
          }
        }
      } catch (err) {
        console.error('Error sending approval notification:', err);
      }
    } else if (status === 'rejected' && transaction.type === 'withdrawal') {
      // CRITICAL: Refund coins if withdrawal is rejected
      if (!user.wallet) user.wallet = { coins: 0 };
      user.wallet.coins += (transaction.coinsAmount || 0);
      await user.save();

      // Send rejection notification
      try {
        const systemAdmin = await User.findOne({ email: 'admin@safeconnect.com' });
        if (systemAdmin) {
          const notificationContent = `❌ Su solicitud de retiro de ${transaction.coinsAmount} monedas ha sido rechazada. ${rejectionReason ? 'Motivo: ' + rejectionReason : ''} Las monedas han sido devueltas a su cuenta. Saldo actual: ${user.wallet.coins} monedas.`;
          await Message.create({
            sender: systemAdmin._id,
            recipient: user._id,
            content: notificationContent,
            isSystem: true
          });
        }
      } catch (err) {
        console.error('Error sending rejection notification:', err);
      }
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewer', 'name email')
      .populate('ad', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    const revieweeId = review.reviewee;
    await review.deleteOne();

    // Recalculate reviewee's average rating
    if (revieweeId) {
      const reviews = await Review.find({ reviewee: revieweeId });
      const count = reviews.length;
      const avgRating = count > 0
        ? parseFloat((reviews.reduce((acc, rev) => acc + rev.rating, 0) / count).toFixed(1))
        : 0;
      await User.findByIdAndUpdate(revieweeId, { rating: avgRating, reviewCount: count });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update Ad (suspend/activate)
// @route   PUT /api/admin/ads/:id
exports.updateAdAdmin = async (req, res) => {
  try {
    const allowedUpdates = ['isActive', 'isVerified', 'plan', 'rejectedReason'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const ad = await Ad.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!ad) return res.status(404).json({ success: false, error: 'Ad not found' });
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete Ad
// @route   DELETE /api/admin/ads/:id
exports.deleteAdAdmin = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, error: 'Ad not found' });
    await ad.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Platform Stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalAds: await Ad.countDocuments(),
      pendingVerifications: await User.countDocuments({ 'verificationRequests.status': 'pending' }),
      pendingPayments: await Transaction.countDocuments({ status: 'pending', type: { $in: ['deposit', 'subscription'] } }),
      totalRevenue: await Transaction.aggregate([
        { $match: { status: 'completed', type: { $in: ['deposit', 'subscription'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
