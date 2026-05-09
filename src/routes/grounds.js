// Grounds Routes
const express = require('express');
const router = express.Router();
const { 
    groundsHome,
    getAllGrounds, 
    getMyGrounds,
    getGroundById, 
    createGround,
    updateGround,
    deleteGround,
    getLocations
} = require('../controllers/groundController');
const { authMiddleware } = require('../middleware/auth');

// GET /grounds/ - Health check
router.get('/', groundsHome);

// GET /grounds/locations - Get all active grounds
router.get('/locations', getAllGrounds);

// GET /grounds/locations/:id - Get ground by ID
router.get('/locations/:id', authMiddleware, getGroundById);

// POST /grounds/locations - Create ground (Owner)
router.post('/locations', authMiddleware, createGround);

// PUT /grounds/locations/:id - Update ground (Owner)
router.put('/locations/:id', authMiddleware, updateGround);

// DELETE /grounds/locations/:id - Delete ground (Owner)
router.delete('/locations/:id', authMiddleware, deleteGround);

// GET /grounds/my-grounds - Get owner's grounds
router.get('/my-grounds', authMiddleware, getMyGrounds);

// GET /grounds/locations-list - Get unique locations (Public)
router.get('/locations-list', getLocations);

module.exports = router;
