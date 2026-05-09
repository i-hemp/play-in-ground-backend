// ScheduleRequest Model - Mongoose schema for schedule change requests
// Equivalent to Go's models/schedule_request.go

const mongoose = require('mongoose');

const scheduleRequestSchema = new mongoose.Schema({
    ground_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ground',
        required: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    request_type: {
        type: String,
        default: 'change_hours'
    },
    current_opening: {
        type: String,
        required: true
    },
    current_closing: {
        type: String,
        required: true
    },
    requested_opening: {
        type: String,
        required: true
    },
    requested_closing: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        minlength: 10
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewed_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    collection: 'schedule_requests'
});

// Index for faster queries
scheduleRequestSchema.index({ ground_id: 1, status: 1 });
scheduleRequestSchema.index({ owner_id: 1 });

const ScheduleRequest = mongoose.model('ScheduleRequest', scheduleRequestSchema);

module.exports = ScheduleRequest;
