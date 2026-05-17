const Room = require('../models/Room');
const Booking = require('../models/Booking');


// 1. Thiyena Rooms okkoma ganna (GET)
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Aluth Room ekak database ekata add kirima (POST)
const createRoom = async (req, res) => {
    try {
        const { room_number, type, price, description, image_url } = req.body;

        // Room number eka kalin thiyenawada balamu
        const roomExists = await Room.findOne({ room_number });
        if (roomExists) {
            return res.status(400).json({ message: "Room number already exists!" });
        }

        const room = await Room.create({
            room_number,
            type,
            price,
            description,
            image_url
        });

        res.status(201).json({ message: "Room created successfully!", room });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. Update Room
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.status(200).json({ message: "Room updated successfully", room });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. Delete Room (Soft delete - set to Maintenance)
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, { status: 'Maintenance' }, { new: true });
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.status(200).json({ message: "Room moved to maintenance", room });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. Get Available Rooms based on Date
const getAvailableRooms = async (req, res) => {
    try {
        const { check_in, check_out, type, maxPrice } = req.query;
        
        let query = { status: { $ne: 'Maintenance' } };

        if (type) {
            query.type = type;
        }
        if (maxPrice) {
            query.price = { $lte: Number(maxPrice) };
        }

        if (check_in && check_out) {
            const checkInDate = new Date(check_in);
            const checkOutDate = new Date(check_out);

            const overlappingBookings = await Booking.find({
                status: { $ne: 'Cancelled' },
                $or: [
                    { check_in_date: { $lt: checkOutDate }, check_out_date: { $gt: checkInDate } }
                ]
            });

            const bookedRoomIds = overlappingBookings.map(booking => booking.room);
            query._id = { $nin: bookedRoomIds };
        }

        const availableRooms = await Room.find(query);
        res.status(200).json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getAllRooms, createRoom, updateRoom, deleteRoom, getAvailableRooms };