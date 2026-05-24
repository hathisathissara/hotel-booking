const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    identity_type: {
        type: String,
        enum: ['NIC', 'Passport'],
        required: true
    },
    identity_number: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);