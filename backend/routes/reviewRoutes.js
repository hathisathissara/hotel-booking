const express = require('express');
const { createReview, getRoomReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:roomId', getRoomReviews);

module.exports = router;
