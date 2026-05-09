// Ground Model - Mongoose schema for playground grounds
// Equivalent to Go's models/ground.go

const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    place: {
        type: String,
        required: true,
        trim: true
    },
    image_url: {
        type: String,
        required: true
    },
    price_per_hour: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    map_url: {
        type: String,
        required: true
    },
    sport_types: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'pending', 'suspended', 'rejected'],
        default: 'pending'
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    collection: 'grounds'
});

// Index for location-based searches
groundSchema.index({ place: 1 });

const Ground = mongoose.model('Ground', groundSchema);

module.exports = Ground;
