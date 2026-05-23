const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); 

// 1. Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setting up storage in Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hotel_rooms', // The name of the folder where photos are saved in Cloudinary.
        allowedFormats: ['jpeg', 'png', 'jpg', 'webp'] // Only these formats are allowed.
    }
});

// 3. Multer Upload Object
const upload = multer({ storage: storage });

module.exports = upload;