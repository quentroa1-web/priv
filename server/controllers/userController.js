const User = require('../models/User');

// @desc    Request verification
// @route   POST /api/users/verify
// @access  Private
exports.requestVerification = async (req, res) => {
    try {
        if (!req.files || !req.files.idProof || !req.files.photoProof) {
            return res.status(400).json({ success: false, error: 'Por favor sube tanto la foto de tu documento como la selfie con el documento.' });
        }

        const idProofUrl = req.files.idProof[0].path || req.files.idProof[0].url || req.files.idProof[0].secure_url;
        const photoProofUrl = req.files.photoProof[0].path || req.files.photoProof[0].url || req.files.photoProof[0].secure_url;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        user.verificationRequests = {
            idProof: idProofUrl,
            photoProof: photoProofUrl,
            status: 'pending',
            requestedAt: Date.now()
        };

        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all users (public with limited fields)
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
    try {
        const { role, search, gender, page = 1, limit = 20 } = req.query;

        const query = { status: 'active' };

        // Security: Only allow public listing for specific roles
        if (role && ['user', 'announcer'].includes(role)) {
            query.role = role;
        } else {
            // Default: exclude admins from public directory
            query.role = { $in: ['user', 'announcer'] };
        }

        // Search logic (case-insensitive)
        if (search && typeof search === 'string') {
            // SECURITY: Escape special characters to prevent Regex Injection (ReDoS)
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, 'i');
            query.$or = [
                { name: searchRegex },
                { displayName: searchRegex },
                { 'location.city': searchRegex },
                { 'locationData.city': searchRegex }
            ];
        }

        // Gender filter
        if (gender && typeof gender === 'string') {
            query.gender = gender;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('name displayName avatar bio languages location locationData age gender lastSeen verified role premium isOnline premiumPlan isVip rating reviewCount')
            .sort({ premium: -1, isVip: -1, lastSeen: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
