const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const cloudinary = require('cloudinary').v2;

/**
 * Saves a Base64 image. In development saves to disk, in production uploads to Cloudinary.
 * @param {string} base64Data - The base64 string
 * @param {string} subfolder - The folder/category
 * @returns {Promise<string>} - The URL of the image
 */
const saveBase64Image = async (base64Data, subfolder = 'ads') => {
    if (!base64Data || !base64Data.startsWith('data:image')) {
        // SECURITY: If it's a string but not base64, ensure it's a valid URL or return empty
        if (typeof base64Data === 'string' && (base64Data.startsWith('http') || base64Data.startsWith('/uploads'))) {
            return base64Data;
        }
        return ''; // Block potential XSS like javascript:
    }

    // Use Cloudinary in production or if credentials are available
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
            const result = await cloudinary.uploader.upload(base64Data, {
                folder: `safeconnect_${subfolder}`,
                exif: false,
                image_metadata: false,
                transformation: [
                    { width: 900, height: 1200, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }
                ]
            });
            return result.secure_url;
        } catch (err) {
            console.error('Cloudinary Upload Error:', err);
            // Fallback to local only if NOT in production
            if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
                throw new Error('Error al subir imagen a la nube');
            }
        }
    }

    // Local Disk saving (Development only)
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const targetDir = path.join(__dirname, '../uploads', subfolder, year, month, day);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Formato de imagen Base64 inválido');
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const detectedExt = matches[1].toLowerCase();
    const extension = detectedExt === 'jpeg' ? 'jpg' : detectedExt;

    if (!allowedExtensions.includes(extension)) {
        throw new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, png, gif, webp).');
    }

    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/${subfolder}/${year}/${month}/${day}/${filename}`;
};


module.exports = { saveBase64Image };
