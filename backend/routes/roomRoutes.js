const express = require('express');
const { getAllRooms, createRoom, updateRoom, deleteRoom, getAvailableRooms } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// POST /api/rooms/upload - Upload room image
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    res.status(200).json({ 
        message: "Image uploaded successfully", 
        image_url: `/uploads/${req.file.filename}` 
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