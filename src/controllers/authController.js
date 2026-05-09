// Auth Controller - Handles user signup and login
// Equivalent to Go's handlers/auth.go

const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

/**
 * Signup - Register a new user
 * POST /auth/signup
 * Body: { name, email, password, role }
 */
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate role
        if (!['player', 'owner', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email }).select('+password');
        if (existingUser) {
            return res.status(400).json({ detail: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

/**
 * Login - Authenticate user and return JWT token
 * POST /auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email (include password field)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ detail: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ detail: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken({
            userID: user._id.toString(),
            email: user.email,
            role: user.role
        });

        // Return token and user info
        res.status(200).json({
            token,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * Update Profile - Update logged-in user's profile details
 * PUT /auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userID = req.userID;
        const { name, phone } = req.body;

        if (!userID) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findByIdAndUpdate(
            userID,
            { name, phone },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

module.exports = {
    signup,
    login,
    updateProfile
};
