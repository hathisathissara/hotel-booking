const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                token: token
            });
        } else {
            res.status(401).json({ message: "Invalid Email or Password!" })
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

// User Register
const registerUser = async (req, res) => {
    try {
        const { full_name, email, password, identity_type, identity_number } = req.body;

        // 1. Email eka hari ID eka hari kalin thiyenawada balamu
        const userExists = await User.findOne({
            $or: [{ email }, { identity_number }]
        });

        if (userExists) {
            return res.status(400).json({ message: "Email or Identity Number Already Registere!" })
        }

        // 2. Password eka Hash (Encrypt) karamu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Aluth user wa create karamu
        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            identity_type,
            identity_number
        });


        if (user) {
            res.status(201).json({ message: "User registered successfully!" });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = { registerUser, loginUser };