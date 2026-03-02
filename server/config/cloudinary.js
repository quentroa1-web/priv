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
  transformation: [
    { width: 500, height: 500, crop: 'limit' }
  ],
  params: {
    exif: false,
    image_metadata: false,
    type: 'upload'
  }
});

const storageDocs = CloudinaryStorage({
  cloudinary: cloudinaryWrapper,
  folder: 'safeconnect_verifications',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
  params: {
    exif: false,
    image_metadata: false,
    type: 'private' // SECURITY: Verification docs should not be public by URL
  }
});

// Storage for packs (supports both images and videos)
const storagePacks = CloudinaryStorage({
  cloudinary: cloudinaryWrapper,
  params: {
    folder: 'safeconnect_packs',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'mpeg', 'avi'],
    exif: false,
    image_metadata: false
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max (increased from 5MB)
});

const uploadDocs = multer({
  storage: storageDocs,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const uploadPacks = multer({
  storage: storagePacks,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max for packs (videos)
});

module.exports = { cloudinary, upload, uploadDocs, uploadPacks };
