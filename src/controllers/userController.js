// User Controller - Handles user operations
// Equivalent to Go's handlers/user.go

const User = require('../models/User');

/**
 * Get Profile - Get current logged-in user's profile
 * GET /users/me
 */
const getProfile = async (req, res) => {
    try {
        const userID = req.userID;

        if (!userID) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return safe user info (Mongoose model excludes password by default via select: false)
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

module.exports = {
    getProfile
};
