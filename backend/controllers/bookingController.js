const Booking = require('../models/Booking');
const Room = require('../models/Room');

const createBooking = async (req, res) => {
    try {
        const { room_id, check_in_date, check_out_date } = req.body;
        const user_id = req.user._id;

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (checkIn >= checkOut) {
            return res.status(400).json({ message: "Check-out date must be after check-in date" });
        }

        const overlappingBooking = await Booking.findOne({
            room: room_id,
            status: { $ne: 'Cancelled' },
            $or: [
                { check_in_date: { $lt: checkOut }, check_out_date: { $gt: checkIn } }
            ]
        });
        if (overlappingBooking) {
            return res.status(400).json({ message: "Sorry! This room is already booked for these dates." });
        }
        const room = await Room.findById(room_id);
        if (!room) return res.status(400).json({ message: "room not found!" });

        const timeDifference = checkOut.getTime() - checkIn.getTime();
        const daysToStay = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const total_price = daysToStay * room.price;

        const booking = await Booking.create({
            user: user_id,
            room: room_id,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_price: total_price
        });
        res.status(201).json({ message: "Room booked successfully!", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'full_name email identity_number')
            .populate('room', 'room_number type price');

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = req.body.status;
        await booking.save();

        res.status(200).json({ message: `Booking status updated to ${booking.status}`, booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('room', 'room_number type price image_url');
        
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { createBooking, getAllBookings, updateBookingStatus, getMyBookings };