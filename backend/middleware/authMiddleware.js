const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Frontend eken ena Headers wala token eka thiyenawada balanawa
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // "Bearer hdhsdhsdsd..." kiyana eken token eka witharak gannawa
            token = req.headers.authorization.split(' ')[1];

            // Token eka hari da balanawa
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token eken ena User ID eken database eke userwa hoyala req ekata danawa
            req.user = await User.findById(decoded.id).select('-password');
            next(); // Ilaga wedeta (Booking ekata) yanna denawa

        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed!" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token!" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(401).json({ message: "Not authorized as an admin!" })
    }
};

module.exports = { protect, admin };