// Booking Controller - Handles booking operations
// Equivalent to Go's handlers/bookings.go

const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const mongoose = require('mongoose');

/**
 * Create Booking - Create a new ground booking
 * POST /bookings
 * Body: { ground_id, booking_date, start_time, duration_hours }
 */
const createBooking = async (req, res) => {
    try {
        const { ground_id, booking_date, start_time, duration_hours } = req.body;
        const player_id = req.userID; // From auth middleware

        // Validate required fields
        if (!ground_id || !booking_date || !start_time || !duration_hours) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate duration (1-5 hours)
        if (duration_hours < 1 || duration_hours > 5) {
            return res.status(400).json({ error: 'Duration must be between 1 and 5 hours' });
        }

        // Parse booking date
        const bookingDateObj = new Date(booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysAhead = Math.floor((bookingDateObj - today) / (1000 * 60 * 60 * 24));

        if (daysAhead > 3) {
            return res.status(400).json({ error: 'Can only book up to 3 days in advance' });
        }
        if (daysAhead < 0) {
            return res.status(400).json({ error: 'Cannot book past dates' });
        }

        // Get ground details for price calculation
        const ground = await Ground.findById(ground_id);
        if (!ground) {
            return res.status(404).json({ error: 'Ground not found' });
        }

        // Calculate end time and total price
        const [hours, minutes] = start_time.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const endDate = new Date(startDate.getTime() + duration_hours * 60 * 60 * 1000);
        const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        const total_price = ground.price_per_hour * duration_hours;

        // 2-hour lead time check for today's bookings
        const now = new Date();
        if (bookingDateObj.toDateString() === now.toDateString()) {
            const [startH, startM] = start_time.split(':');
            const slotTime = new Date(now);
            slotTime.setHours(parseInt(startH), parseInt(startM), 0, 0);
            
            const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            if (slotTime < twoHoursFromNow) {
                return res.status(400).json({ error: 'Bookings must be made at least 2 hours in advance' });
            }
        }

        // COMPREHENSIVE CONFLICT CHECK (Overlap Range)
        const newStartHour = parseInt(start_time.split(':')[0]);
        const requestedHours = [];
        for (let i = 0; i < duration_hours; i++) {
            requestedHours.push(newStartHour + i);
        }

        const existingBookings = await Booking.find({
            ground_id,
            booking_date: bookingDateObj,
            status: { $ne: 'cancelled' }
        });

        for (const b of existingBookings) {
            const bStartHour = parseInt(b.start_time.split(':')[0]);
            for (let j = 0; j < b.duration_hours; j++) {
                const occupiedHour = bStartHour + j;
                if (requestedHours.includes(occupiedHour)) {
                    return res.status(409).json({
                        error: `Time slot conflict: ${occupiedHour}:00 is already booked.`
                    });
                }
            }
        }

        // Create booking
        const booking = await Booking.create({
            ground_id,
            player_id,
            booking_date: bookingDateObj,
            start_time,
            end_time: `${(newStartHour + duration_hours).toString().padStart(2, '0')}:00`,
            duration_hours,
            total_price,
            status: 'confirmed',
            payment_status: 'pending'
        });

        res.status(201).json({
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

/**
 * Get My Bookings - Get all bookings for logged-in user
 * GET /bookings/my-bookings
 */
const getMyBookings = async (req, res) => {
    try {
        const player_id = req.userID;

        const bookings = await Booking.find({ player_id })
            .populate('ground_id', 'name place image_url')
            .sort({ booking_date: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

/**
 * Get Booking by ID
 * GET /bookings/:id
 */
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('ground_id', 'name place image_url price_per_hour');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

/**
 * Cancel Booking
 * DELETE /bookings/:id
 */
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const player_id = req.userID;

        const booking = await Booking.findOne({ _id: id, player_id });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking already cancelled' });
        }

        booking.status = 'cancelled';
        booking.updated_at = new Date();
        await booking.save();

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

/**
 * Get Owner Stats - Calculate statistics for owner grounds
 * GET /bookings/owner-stats
 */
const getOwnerStats = async (req, res) => {
    try {
        const userID = req.userID;
        if (!userID) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Get all grounds owned by this user
        const grounds = await Ground.find({ owner_id: userID });
        const groundIDs = grounds.map(g => g._id);

        if (groundIDs.length === 0) {
            return res.status(200).json({
                total_bookings: 0,
                total_revenue: 0,
                active_grounds: 0
            });
        }

        // 2. Aggregate Booking Stats
        const stats = await Booking.aggregate([
            {
                $match: {
                    ground_id: { $in: groundIDs },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: '$total_price' },
                    total_bookings: { $sum: 1 }
                }
            }
        ]);

        const result = stats.length > 0 ? {
            total_revenue: stats[0].total_revenue,
            total_bookings: stats[0].total_bookings
        } : {
            total_revenue: 0,
            total_bookings: 0
        };

        result.active_grounds = groundIDs.length;

        res.status(200).json(result);
    } catch (error) {
        console.error('Get owner stats error:', error);
        res.status(500).json({ error: 'Failed to fetch owner stats' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getOwnerStats
};
