const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
        if (room.status === 'Maintenance') {
            return res.status(400).json({ message: "Sorry! This room is currently under maintenance and cannot be booked." });
        }

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

        if (req.user && req.user.email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: 'Your Booking is Confirmed! - Luxury Hotel',
                text: `Dear ${req.user.full_name},\n\nYour booking for Room ${room.room_number} (${room.type}) is confirmed.\n\nCheck-in: ${checkIn.toDateString()}\nCheck-out: ${checkOut.toDateString()}\nTotal Price: LKR ${total_price}\n\nThank you for choosing Luxury Hotel!`
            };
            transporter.sendMail(mailOptions).catch(err => console.error('Email sending failed:', err));
        }

        res.status(201).json({ message: "Room booked successfully!", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const createAdminBooking = async (req, res) => {
    try {
        const { full_name, identity_type, identity_number, phone_number, room_id, check_in_date, check_out_date } = req.body;

        if (!full_name || !identity_type || !identity_number || !phone_number || !room_id || !check_in_date || !check_out_date) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

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
        if (!room) return res.status(400).json({ message: "Room not found!" });
        if (room.status === 'Maintenance') {
            return res.status(400).json({ message: "Sorry! This room is currently under maintenance." });
        }

        let user = await User.findOne({ identity_number });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('walkin123', salt);
            user = await User.create({
                full_name,
                email: `walkin_${identity_number}_${Date.now()}@lumiere.com`,
                password: hashedPassword,
                phone_number,
                identity_type,
                identity_number,
                role: 'customer'
            });
        } else if (!user.phone_number) {
            user.phone_number = phone_number;
            await user.save();
        }

        const timeDifference = checkOut.getTime() - checkIn.getTime();
        const daysToStay = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const total_price = daysToStay * room.price;

        const booking = await Booking.create({
            user: user._id,
            room: room_id,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_price,
            status: 'Confirmed'
        });

        res.status(201).json({ message: "Booking created successfully by Admin!", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'full_name email phone_number identity_number')
            .populate('room', 'room_number type price')
            .sort({ createdAt: -1 });

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

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === 'Checked-in' || booking.status === 'Checked-out') {
            return res.status(400).json({ message: "Cannot cancel a booking that has already started" });
        }

        booking.status = 'Cancelled';
        await booking.save();

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { createBooking, createAdminBooking, getAllBookings, updateBookingStatus, getMyBookings, cancelBooking };