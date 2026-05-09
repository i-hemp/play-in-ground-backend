// Booking Model - Mongoose schema for ground bookings
// Equivalent to Go's models/booking.go

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ground_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ground',
        required: true
    },
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking_date: {
        type: Date,
        required: true
    },
    start_time: {
        type: String,
        required: true // Format: "HH:MM" e.g., "09:00"
    },
    end_time: {
        type: String,
        required: true // Format: "HH:MM" e.g., "12:00"
    },
    duration_hours: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    total_price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false, // Using custom created_at/updated_at
    collection: 'bookings'
});

// Indexes for faster queries
bookingSchema.index({ player_id: 1, booking_date: -1 });
bookingSchema.index({ ground_id: 1, booking_date: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
