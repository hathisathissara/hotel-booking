const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Registered user reference (optional — null for walk-in guests)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null,
        ref: 'User'
    },

    // Walk-in guest details (used when user is null)
    guest_name: { type: String, default: null },
    guest_phone: { type: String, default: null },
    guest_address: { type: String, default: null },
    guest_identity_type: {
        type: String,
        enum: ['NIC', 'Passport', null],
        default: null
    },
    guest_identity_number: { type: String, default: null },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Room'
    },
    check_in_date: {
        type: Date,
        required: true
    },
    check_out_date: {
        type: Date,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Checked-in', 'Checked-out'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);