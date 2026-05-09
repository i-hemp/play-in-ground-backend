// Server entry point
// Starts Express server and connects to MongoDB

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// CORS configuration - allow frontend requests
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const bookingRoutes = require('./src/routes/bookings');
const groundRoutes = require('./src/routes/grounds');
const availabilityRoutes = require('./src/routes/availability');
const adminRoutes = require('./src/routes/admin');

// Mount routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);
app.use('/grounds', availabilityRoutes); // Availability routes are under /grounds/:id/...
app.use('/grounds', groundRoutes);
app.use('/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'PlayInGround Backend API is running (Node.js)',
        version: '1.0.0',
        database: 'MongoDB',
        endpoints: {
            auth: '/auth/signup, /auth/login',
            bookings: '/bookings',
            grounds: '/grounds',
            availability: '/grounds/:id/availability',
            admin: '/admin/schedule-requests'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
