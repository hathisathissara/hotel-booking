const express = require('express');
const { createBooking, createAdminBooking, getAllBookings, updateBookingStatus, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware'); // Guard wa genawa

const router = express.Router();

router.get('/my', protect, getMyBookings);

// protect eka dapu nisa token nathi aya methanadi block wenawa
router.post('/', protect, createBooking);

router.post('/admin', protect, admin, createAdminBooking);

router.get('/', protect, admin, getAllBookings);

router.put('/:id/status', protect, admin, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;