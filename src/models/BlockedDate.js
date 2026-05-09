// BlockedDate Model - Mongoose schema for blocked dates
// Equivalent to Go's models/blocked_date.go

const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema({
    ground_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ground',
        required: true
    },
    blocked_date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true,
        minlength: 5
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    days_notice: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    collection: 'blocked_dates'
});

// Index for faster queries
blockedDateSchema.index({ ground_id: 1, blocked_date: 1 });

const BlockedDate = mongoose.model('BlockedDate', blockedDateSchema);

module.exports = BlockedDate;
