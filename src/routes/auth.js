// Auth Routes
const express = require('express');
const router = express.Router();
const { signup, login, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /auth/signup
router.post('/signup', signup);

// POST /auth/login
router.post('/login', login);

// PUT /auth/profile
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
