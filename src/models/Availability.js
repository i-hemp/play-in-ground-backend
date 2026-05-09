// Availability Model - Mongoose schema for ground availability schedules
// Equivalent to Go's models/availability.go

const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    ground_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ground',
        required: true
    },
    day_of_week: {
        type: Number,
        required: true,
        min: 0,
        max: 6 // 0=Sunday, 1=Monday, ..., 6=Saturday
    },
    is_available: {
        type: Boolean,
        default: true
    },
    opening_time: {
        type: String,
        default: '06:00'
    },
    closing_time: {
        type: String,
        default: '22:00'
    },
    slot_duration: {
        type: Number,
        default: 60 // minutes
    },
    is_default_hours: {
        type: Boolean,
        default: true
    },
    custom_hours_approved: {
        type: Boolean,
        default: false
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approved_at: {
        type: Date
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
    timestamps: false,
    collection: 'ground_availability'
});

// Index for faster queries
availabilitySchema.index({ ground_id: 1, day_of_week: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
