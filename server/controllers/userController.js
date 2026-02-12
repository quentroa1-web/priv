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
