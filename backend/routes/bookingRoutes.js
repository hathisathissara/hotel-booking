const express = require('express');
const { createBooking, getAllBookings, updateBookingStatus, getMyBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware'); // Guard wa genawa

const router = express.Router();

router.get('/my', protect, getMyBookings);

// protect eka dapu nisa token nathi aya methanadi block wenawa
router.post('/', protect, createBooking);


router.get('/', protect, admin, getAllBookings);

router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;