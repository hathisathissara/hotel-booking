const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

        // 1. Arrivals Today
        const arrivalsToday = await Booking.countDocuments({
            check_in_date: { $gte: startOfToday, $lte: endOfToday },
            status: { $ne: 'Cancelled' }
        });

        // 2. This Month's Revenue
        const monthlyBookings = await Booking.find({
            createdAt: { $gte: startOfMonth },
            status: { $ne: 'Cancelled' }
        });
        
        const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.total_price, 0);

        // 3. Total Active Rooms
        const totalRooms = await Room.countDocuments({ status: { $ne: 'Maintenance' } });

        // 4. Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        res.status(200).json({
            arrivalsToday,
            monthlyRevenue,
            totalRooms,
            totalUsers
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getDashboardStats };
