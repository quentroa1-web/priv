const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Ad = require('../models/Ad');

// Simple HTML tag stripper to prevent XSS in user-generated content
const sanitize = (str) => {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '').trim();
};

// @desc    Calculate and update user rating
const updateUserRating = async (userId) => {
    const reviews = await Review.find({ reviewee: userId });

    const count = reviews.length;
    const avgRating = count > 0
        ? parseFloat((reviews.reduce((acc, rev) => acc + rev.rating, 0) / count).toFixed(1))
        : 0;

    await User.findByIdAndUpdate(userId, {
        rating: avgRating,
        reviewCount: count
    });
};

// @desc    Submit a review for an appointment
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment, categories } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Cita no encontrada' });
        }

        if (appointment.status !== 'completed') {
            return res.status(400).json({ success: false, error: 'Solo puedes calificar citas completadas' });
        }

        // Prevent self-reviews
        if (appointment.client.toString() === appointment.announcer.toString()) {
            return res.status(400).json({ success: false, error: 'No puedes calificarte a ti mismo' });
        }

        let type, reviewee;
        if (appointment.client.toString() === req.user.id) {
            // Client reviewing Announcer
            if (appointment.announcerReviewed) {
                return res.status(400).json({ success: false, error: 'Ya has calificado esta cita' });
            }
            type = 'client-to-announcer';
            reviewee = appointment.announcer;
            appointment.announcerReviewed = true;
        } else if (appointment.announcer.toString() === req.user.id) {
            // Announcer reviewing Client
            if (appointment.clientReviewed) {
                return res.status(400).json({ success: false, error: 'Ya has calificado esta cita' });
            }
            type = 'announcer-to-client';
            reviewee = appointment.client;
            appointment.clientReviewed = true;
        } else {
            return res.status(403).json({ success: false, error: 'No autorizado para calificar esta cita' });
        }

        // Sanitize comment to prevent XSS
        const safeComment = sanitize(comment);
        if (safeComment.length < 5) {
            return res.status(400).json({ success: false, error: 'El comentario debe tener al menos 5 caracteres válidos' });
        }

        const review = await Review.create({
            ad: appointment.ad,
            appointment: appointmentId,
            reviewer: req.user.id,
            reviewee,
            rating,
            comment: safeComment,
            categories,
            type,
            isVerified: true // Automatically verified since it's from a completed appointment
        });

        await appointment.save();

        // Update user rating
        await updateUserRating(reviewee);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Respond to a review
// @route   POST /api/reviews/:id/response
// @access  Private
exports.respondToReview = async (req, res) => {
    try {
        const { content } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Reseña no encontrada' });
        }

        // Only the reviewee can respond
        if (review.reviewee.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'No autorizado para responder a esta reseña' });
        }

        // Prevent overwriting existing responses
        if (review.response && review.response.content) {
            return res.status(400).json({ success: false, error: 'Ya has respondido a esta reseña' });
        }

        review.response = {
            content: sanitize(content),
            createdAt: Date.now()
        };

        await review.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Reseña no encontrada' });
        }

        // Check if user already marked as helpful
        const alreadyHelpful = review.helpfulUsers.includes(req.user.id);
        if (alreadyHelpful) {
            return res.status(400).json({ success: false, error: 'Ya has marcado esta reseña como útil' });
        }

        review.helpfulUsers.push(req.user.id);
        review.helpful = review.helpfulUsers.length;

        await review.save();

        res.status(200).json({
            success: true,
            data: { helpful: review.helpful }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId })
            .populate('reviewer', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
