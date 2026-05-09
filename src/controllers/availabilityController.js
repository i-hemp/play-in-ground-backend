// Availability Controller - Handles ground availability operations
// Equivalent to Go's handlers/availability.go

const Availability = require('../models/Availability');
const BlockedDate = require('../models/BlockedDate');
const Booking = require('../models/Booking');

/**
 * Get Booked Slots - Get occupied time slots for a ground on a specific date
 * GET /grounds/:id/booked-slots?date=YYYY-MM-DD
 */
const getBookedSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date query parameter is required' });
        }

        const bookingDate = new Date(date);
        
        const bookings = await Booking.find({
            ground_id: id,
            booking_date: bookingDate,
            status: { $ne: 'cancelled' }
        });

        const occupied = bookings.map(b => ({
            start_time: b.start_time,
            duration: b.duration_hours
        }));

        res.status(200).json(occupied);
    } catch (error) {
        console.error('Get booked slots error:', error);
        res.status(500).json({ error: 'Failed to fetch booked slots' });
    }
};

/**
 * Get Availability for a ground
 * GET /grounds/:id/availability
 */
const getAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        const availability = await Availability.find({ ground_id: id }).sort({ day_of_week: 1 });

        res.status(200).json(availability);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

/**
 * Set Availability for a ground (Owner only)
 * POST /grounds/:id/availability
 */
const setAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { day_of_week, is_available } = req.body;

        // Validate day_of_week
        if (day_of_week < 0 || day_of_week > 6) {
            return res.status(400).json({ error: 'day_of_week must be between 0 and 6' });
        }

        // Check if availability exists for this ground and day
        let availability = await Availability.findOne({ ground_id: id, day_of_week });

        if (availability) {
            // Update existing
            availability.is_available = is_available;
            availability.updated_at = new Date();
            await availability.save();
        } else {
            // Create new
            availability = await Availability.create({
                ground_id: id,
                day_of_week,
                is_available
            });
        }

        res.status(200).json({
            message: 'Availability updated successfully',
            availability
        });
    } catch (error) {
        console.error('Set availability error:', error);
        res.status(500).json({ error: 'Failed to set availability' });
    }
};

/**
 * Block a date (Owner only)
 * POST /grounds/:id/block-date
 */
const blockDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { blocked_date, reason } = req.body;
        const created_by = req.userID;

        if (!blocked_date || !reason) {
            return res.status(400).json({ error: 'blocked_date and reason are required' });
        }

        const blockedDateObj = new Date(blocked_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days_notice = Math.floor((blockedDateObj - today) / (1000 * 60 * 60 * 24));

        if (days_notice < 4) {
            return res.status(400).json({ error: 'Must provide at least 4 days notice' });
        }

        const blockedDateDoc = await BlockedDate.create({
            ground_id: id,
            blocked_date: blockedDateObj,
            reason,
            created_by,
            days_notice
        });

        res.status(201).json({
            message: 'Date blocked successfully',
            blocked_date: blockedDateDoc
        });
    } catch (error) {
        console.error('Block date error:', error);
        res.status(500).json({ error: 'Failed to block date' });
    }
};

module.exports = {
    getBookedSlots,
    getAvailability,
    setAvailability,
    blockDate
};
