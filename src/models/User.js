// User Model - Mongoose schema for users
// Equivalent to Go's models/user.go

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        required: true,
        enum: ['player', 'owner', 'admin'],
        default: 'player'
    },
    phone: {
        type: String,
        trim: true
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: 'users' // Explicit collection name
});

// Index for faster email lookups
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
