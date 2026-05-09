// Authentication Middleware - JWT validation for protected routes
// Equivalent to Go's middleware/auth.go

const { validateToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token and extract user info
 * Protects routes that require authentication
 */
const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        // Validate and decode token
        const decoded = validateToken(authHeader);

        // Attach user info to request object for use in controllers
        req.user = {
            id: decoded.userID,
            email: decoded.email,
            role: decoded.role
        };

        // Also set userID for compatibility with Go backend pattern
        req.userID = decoded.userID;

        // Continue to next middleware/controller
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message || 'Unauthorized' });
    }
};

/**
 * Middleware to check if user has specific role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    requireRole
};
