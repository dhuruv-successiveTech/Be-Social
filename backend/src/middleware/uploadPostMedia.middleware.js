const multer = require('multer');
const cloudinary = require('../config/cloudinary.config');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine if the file is an image or video based on mimetype
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = path.basename(file.originalname, ext);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    
    return {
      folder: 'social-app-posts',
      format: ext.slice(1), // Remove the dot from extension
      public_id: `${filename}-${uniqueSuffix}`,
      resource_type: isVideo ? 'video' : 'image',
      transformation: isVideo ? [
        {
          width: 1280,
          height: 720,
          crop: 'limit',
          quality: 'auto',
          format: 'mp4'
        }
      ] : [
        {
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ]
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  // Check file type
  if (!allowedImageTypes.includes(file.mimetype) && !allowedVideoTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only images (JPG, PNG, GIF, WEBP) and videos (MP4, MOV, AVI, WEBM) are allowed.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per upload
  }
});

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  const uploadMultiple = upload.array('media', 10); // Handle multiple files, max 10

  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 50MB.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 10 files per post.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error uploading files.'
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;