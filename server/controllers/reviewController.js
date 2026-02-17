const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Ad = require('../models/Ad');

// @desc    Calculate and update user rating
const updateUserRating = async (userId) => {
    const reviews = await Review.find({ reviewee: userId });
    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(userId, {
        rating: avgRating.toFixed(1),
        reviewCount: reviews.length
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
            return res.status(401).json({ success: false, error: 'No autorizado para calificar esta cita' });
        }

        const review = await Review.create({
            ad: appointment.ad,
            appointment: appointmentId,
            reviewer: req.user.id,
            reviewee,
            rating,
            comment,
            categories,
            type
        });

        await appointment.save();

        // Update user rating
        await updateUserRating(reviewee);

        res.status(201).json({
            success: true,
            data: review
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
