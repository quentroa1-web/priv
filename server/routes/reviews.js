const express = require('express');
const router = express.Router();
const {
    createReview,
    getUserReviews,
    respondToReview,
    markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const { validate, reviewSchema, reviewResponseSchema } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

// Rate limiter: 10 reviews per hour per IP
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { success: false, error: 'Has alcanzado el límite de reseñas por hora.' }
});

router.post('/', protect, reviewLimiter, validate(reviewSchema), createReview);
router.get('/user/:userId', getUserReviews);
router.post('/:id/response', protect, validate(reviewResponseSchema), respondToReview);
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;
