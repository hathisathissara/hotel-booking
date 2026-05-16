const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // .env file eke thiyena MONGO_URI ekata connect wenawa
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Error ekak awoth server eka stop karanawa
    }
};

module.exports = connectDB;