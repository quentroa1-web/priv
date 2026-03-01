const express = require('express');
const router = express.Router();
const { upload, uploadDocs } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Upload profile image
// @route   POST /api/upload/profile
// @access  Private
router.post('/profile', protect, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se recibieron ninguna imagen.' });
        }

        const imageUrl = req.file.secure_url || req.file.url || req.file.path;

        res.status(200).json({
            success: true,
            url: imageUrl
        });
    });
});

// @desc    Upload payment proof / document (No resize)
// @route   POST /api/upload/proof
// @access  Private
router.post('/proof', protect, (req, res) => {
    uploadDocs.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se recibió ninguna imagen.' });
        }

        const imageUrl = req.file.secure_url || req.file.url || req.file.path;

        res.status(200).json({
            success: true,
            url: imageUrl
        });
    });
});

// @desc    Upload multiple images (Original, for Ads)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, (req, res) => {
    upload.array('images', 50)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No se recibieron imágenes.' });
        }

        const urls = req.files.map(file => file.secure_url || file.url || file.path);

        res.status(200).json({
            success: true,
            urls
        });
    });
});

// @desc    Upload pack content (Images & Videos)
// @route   POST /api/upload/packs
// @access  Private
const { uploadPacks } = require('../config/cloudinary');
router.post('/packs', protect, (req, res) => {
    uploadPacks.array('files', 50)(req, res, (err) => {
        if (err) {
            console.error('Pack upload error:', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No se recibieron archivos.' });
        }

        const urls = req.files.map(file => file.secure_url || file.url || file.path);

        res.status(200).json({
            success: true,
            urls
        });
    });
});

module.exports = router;
