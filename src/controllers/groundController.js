// Ground Controller - Handles ground operations
// Equivalent to Go's handlers/grounds.go

const Ground = require('../models/Ground');

/**
 * Grounds Home - Health check for grounds API
 * GET /grounds/
 */
const groundsHome = async (req, res) => {
    res.status(200).json({
        message: 'PlayInGround Backend API for grounds is running'
    });
};

/**
 * Get All Grounds - Get all active grounds
 * GET /grounds/locations
 */
const getAllGrounds = async (req, res) => {
    try {
        // Find only ACTIVE grounds for public viewing
        const grounds = await Ground.find({ status: 'active' });
        res.status(200).json(grounds);
    } catch (error) {
        console.error('Get grounds error:', error);
        res.status(500).json({ error: 'Failed to fetch grounds' });
    }
};

/**
 * Get My Grounds - Get all grounds for logged-in owner
 * GET /grounds/my-grounds
 */
const getMyGrounds = async (req, res) => {
    try {
        const owner_id = req.userID;
        if (!owner_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const grounds = await Ground.find({ owner_id });
        res.status(200).json(grounds);
    } catch (error) {
        console.error('Get my grounds error:', error);
        res.status(500).json({ error: 'Failed to fetch my grounds' });
    }
};

/**
 * Get Ground by ID
 * GET /grounds/locations/:id
 */
const getGroundById = async (req, res) => {
    try {
        const { id } = req.params;
        const ground = await Ground.findById(id);

        if (!ground) {
            return res.status(404).json({ detail: 'Location not found' });
        }

        // SECURITY: If not active, only Owner or Admin can see it
        if (ground.status !== 'active') {
            const userID = req.userID;
            const userRole = req.user?.role;

            const isOwner = userID && userID === ground.owner_id.toString();
            const isAdmin = userRole === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(404).json({ detail: 'Location not found or pending verification' });
            }
        }

        res.status(200).json(ground);
    } catch (error) {
        console.error('Get ground error:', error);
        res.status(500).json({ error: 'Failed to fetch ground' });
    }
};

/**
 * Create Ground (Owner only)
 * POST /grounds/locations
 */
const createGround = async (req, res) => {
    try {
        const { name, place, image_url, price_per_hour, description, map_url, sport_types } = req.body;
        const owner_id = req.userID;

        if (!owner_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate required fields
        if (!name || !place || !image_url || !price_per_hour || !description || !map_url) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const ground = await Ground.create({
            name,
            place,
            image_url,
            price_per_hour,
            description,
            map_url,
            sport_types: sport_types || [],
            owner_id,
            status: 'pending' // All new grounds must be verified
        });

        res.status(201).json(ground);
    } catch (error) {
        console.error('Create ground error:', error);
        res.status(500).json({ error: 'Failed to create ground' });
    }
};

/**
 * Update Ground (Owner only)
 * PUT /grounds/locations/:id
 */
const updateGround = async (req, res) => {
    try {
        const { id } = req.params;
        const owner_id = req.userID;
        const updateData = req.body;

        if (!owner_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Remove status and owner_id from update data to prevent manual changes
        delete updateData.status;
        delete updateData.owner_id;

        const ground = await Ground.findOneAndUpdate(
            { _id: id, owner_id },
            { $set: updateData },
            { new: true }
        );

        if (!ground) {
            return res.status(403).json({ detail: 'Location not found or permission denied' });
        }

        res.status(200).json(ground);
    } catch (error) {
        console.error('Update ground error:', error);
        res.status(500).json({ error: 'Failed to update ground' });
    }
};

/**
 * Delete Ground (Owner only)
 * DELETE /grounds/locations/:id
 */
const deleteGround = async (req, res) => {
    try {
        const { id } = req.params;
        const owner_id = req.userID;

        if (!owner_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await Ground.deleteOne({ _id: id, owner_id });

        if (result.deletedCount === 0) {
            return res.status(403).json({ detail: 'Location not found or permission denied' });
        }

        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Delete ground error:', error);
        res.status(500).json({ error: 'Failed to delete ground' });
    }
};

/**
 * Get Unique Locations (Public)
 * GET /grounds/locations-list
 */
const getLocations = async (req, res) => {
    try {
        const locations = await Ground.distinct('place', { status: 'active' });
        res.status(200).json(locations);
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

module.exports = {
    groundsHome,
    getAllGrounds,
    getMyGrounds,
    getGroundById,
    createGround,
    updateGround,
    deleteGround,
    getLocations
};
