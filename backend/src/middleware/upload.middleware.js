const multer = require('multer');
const cloudinary = require('../config/cloudinary.config');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-app-avatars', // Folder in Cloudinary to store avatars
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage: storage });

module.exports = upload;