const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Wrapper to satisfy multer-storage-cloudinary 2.x which expects .v2
const cloudinaryWrapper = { v2: cloudinary };

const storage = CloudinaryStorage({
  cloudinary: cloudinaryWrapper,
  folder: 'safeconnect_profiles',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }]
});

const storageDocs = CloudinaryStorage({
  cloudinary: cloudinaryWrapper,
  folder: 'safeconnect_verifications',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  transformation: [] // No transformation to keep original quality/aspect ratio
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max

});

const uploadDocs = multer({
  storage: storageDocs,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max for docs
});

module.exports = { cloudinary, upload, uploadDocs };
