// Booking Routes
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
} = require('../controllers/bookingController');

// All booking routes require authentication
router.use(authMiddleware);

// POST /bookings - Create new booking
router.post('/', createBooking);

// GET /bookings/my-bookings - Get user's bookings
router.get('/my-bookings', getMyBookings);

// GET /bookings/:id - Get booking by ID
router.get('/:id', getBookingById);

// DELETE /bookings/:id - Cancel booking
router.delete('/:id', cancelBooking);

module.exports = router;
