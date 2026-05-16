const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    room_number: { 
        type: String, 
        required: true, 
        unique: true 
    },
    type: { 
        type: String, 
        enum: ['Single', 'Double', 'Family', 'Suite'], 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    image_url: { 
        type: String, 
        default: "https://via.placeholder.com/300x200?text=Hotel+Room" // Photo ekak damma natham meka pennanawa
    },
    status: { 
        type: String, 
        enum: ['Available', 'Booked', 'Maintenance'], 
        default: 'Available' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);