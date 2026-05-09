// Database configuration and connection
// Connects to MongoDB using Mongoose ODM
// Equivalent to Go's database/database.go

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ doesn't need these options, but keeping for compatibility
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);

        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;
