const Review = require('../models/Review');
const Booking = require('../models/Booking');

// POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { room_id, rating, comment } = req.body;
        const user_id = req.user._id;

        // Check if user has actually booked this room
        const hasBooked = await Booking.findOne({ user: user_id, room: room_id, status: { $ne: 'Cancelled' } });
        if (!hasBooked) {
            return res.status(400).json({ message: "You can only review rooms you have booked." });
        }

        // Check if already reviewed
        const alreadyReviewed = await Review.findOne({ user: user_id, room: room_id });
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this room." });
        }

        const review = await Review.create({
            user: user_id,
            room: room_id,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ message: "Review added successfully!", review });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET /api/reviews/:roomId
const getRoomReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ room: req.params.roomId }).populate('user', 'full_name');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { createReview, getRoomReviews };
