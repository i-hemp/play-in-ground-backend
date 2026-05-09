// JWT Utility - Token generation and validation
// Equivalent to Go's utils/jwt.go

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.userID - User's MongoDB ObjectId
 * @param {string} payload.email - User's email
 * @param {string} payload.role - User's role (player/owner/admin)
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    const { userID, email, role } = payload;

    // Create token with same structure as Go backend
    const token = jwt.sign(
        {
            userID,
            email,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '24h' // Match Go backend expiration
        }
    );

    return token;
};

/**
 * Validate and decode JWT token
 * @param {string} token - JWT token to validate
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const validateToken = (token) => {
    try {
        // Remove "Bearer " prefix if present
        const cleanToken = token.replace('Bearer ', '');

        // Verify and decode token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token validation failed');
        }
    }
};

module.exports = {
    generateToken,
    validateToken
};
