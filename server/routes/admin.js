const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUserAdmin,
    deleteUser,
    getAllAds,
    updateAdAdmin,
    deleteAdAdmin,
    verifyAd,
    getVerifications,
    handleVerification,
    getPayments,
    handlePayment,
    getReviews,
    deleteReview,
    getStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate, adminUpdateUserSchema } = require('../middleware/validate');

router.use(protect, adminOnly);

// Users
router.get('/users', getUsers);
router.put('/users/:id', validate(adminUpdateUserSchema), updateUserAdmin);
router.delete('/users/:id', deleteUser);

// Ads
router.get('/ads', getAllAds);
router.put('/ads/:id', updateAdAdmin);
router.delete('/ads/:id', deleteAdAdmin);
router.put('/ads/:id/verify', verifyAd);

// Verifications
router.get('/verifications', getVerifications);
router.put('/verifications/:id', handleVerification);

// Payments & Billing
router.get('/payments', getPayments);
router.put('/payments/:id', handlePayment);

// Reviews
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// Dashboard
router.get('/stats', getStats);

module.exports = router;
