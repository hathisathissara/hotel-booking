const express = require('express');
const { getAllRooms, createRoom, updateRoom, deleteRoom, getAvailableRooms } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// POST /api/rooms/upload - Upload room image to Cloudinary
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    
    // The Live URL (req.file.path) provided by Cloudinary is sent to the Frontend.
    res.status(200).json({ 
        message: "Image uploaded successfully", 
        image_url: req.file.path 
    });
});

// GET /api/rooms/available - Available rooms pennanna
router.get('/available', getAvailableRooms);

// GET /api/rooms - Okkoma rooms pennanna
router.get('/', getAllRooms);

// POST /api/rooms - Aluth room ekak add karanna
router.post('/', protect, admin, createRoom);

// PUT /api/rooms/:id - Room eka update karanna
router.put('/:id', protect, admin, updateRoom);

// DELETE /api/rooms/:id - Room eka delete karanna
router.delete('/:id', protect, admin, deleteRoom);

module.exports = router;