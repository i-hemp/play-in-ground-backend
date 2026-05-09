// Availability Routes
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
    getAvailability,
    setAvailability,
    blockDate,
    getBookedSlots
} = require('../controllers/availabilityController');
const { requestHoursChange } = require('../controllers/adminController');

// Public route
// GET /grounds/:id/availability - Get ground availability
router.get('/:id/availability', getAvailability);

// GET /grounds/:id/booked-slots - Get booked slots
router.get('/:id/booked-slots', getBookedSlots);

// Protected routes (Owner only)
// POST /grounds/:id/availability - Set availability
router.post('/:id/availability', authMiddleware, requireRole('owner', 'admin'), setAvailability);

// POST /grounds/:id/block-date - Block a date
router.post('/:id/block-date', authMiddleware, requireRole('owner', 'admin'), blockDate);

// POST /grounds/:id/request-hours-change - Request custom hours
router.post('/:id/request-hours-change', authMiddleware, requireRole('owner'), requestHoursChange);

module.exports = router;
