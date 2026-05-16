const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Aluthen ekathu kara
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const roomRoutes = require('./routes/roomRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes.js');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// --- API Routes  ---
app.use('/api/users', userRoutes); 
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// 1. 'frontend' folder eka static folder ekak widiyata set karanawa
app.use(express.static(path.join(__dirname, '../frontend')));


// home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// users
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});


// admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// customer bookings
app.get('/my-bookings', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/my-bookings.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});