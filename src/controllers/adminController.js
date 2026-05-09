const ScheduleRequest = require('../models/ScheduleRequest');
const Availability = require('../models/Availability');
const User = require('../models/User');
const Ground = require('../models/Ground');

/**
 * Get All Users (Admin only)
 * GET /admin/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * Get All Grounds (Admin only)
 * GET /admin/grounds
 */
const getAllGroundsAdmin = async (req, res) => {
    try {
        const grounds = await Ground.find().populate('owner_id', 'name email');
        res.status(200).json(grounds);
    } catch (error) {
        console.error('Get all grounds admin error:', error);
        res.status(500).json({ error: 'Failed to fetch grounds' });
    }
};

/**
 * Verify Ground (Admin only)
 * PUT /admin/grounds/:id/verify
 */
const verifyGround = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'pending', 'suspended', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const ground = await Ground.findByIdAndUpdate(id, { status }, { new: true });
        if (!ground) {
            return res.status(404).json({ error: 'Ground not found' });
        }

        res.status(200).json({ message: `Ground status updated to ${status}` });
    } catch (error) {
        console.error('Verify ground error:', error);
        res.status(500).json({ error: 'Failed to update ground status' });
    }
};

/**
 * Request Hours Change (Owner only)
 * POST /grounds/:id/request-hours-change
 */
const requestHoursChange = async (req, res) => {
    try {
        const { id } = req.params;
        const { requested_opening, requested_closing, reason } = req.body;
        const owner_id = req.userID;

        if (!requested_opening || !requested_closing || !reason) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Get current hours
        const availability = await Availability.findOne({ ground_id: id });
        const current_opening = availability?.opening_time || '06:00';
        const current_closing = availability?.closing_time || '22:00';

        const request = await ScheduleRequest.create({
            ground_id: id,
            owner_id,
            request_type: 'change_hours',
            current_opening,
            current_closing,
            requested_opening,
            requested_closing,
            reason,
            status: 'pending'
        });

        res.status(201).json({
            message: 'Request submitted successfully',
            request
        });
    } catch (error) {
        console.error('Request hours change error:', error);
        res.status(500).json({ error: 'Failed to submit request' });
    }
};

/**
 * Get Pending Requests (Admin only)
 * GET /admin/schedule-requests
 */
const getPendingRequests = async (req, res) => {
    try {
        const requests = await ScheduleRequest.find({ status: 'pending' })
            .populate('ground_id', 'name place')
            .populate('owner_id', 'name email')
            .sort({ created_at: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

/**
 * Approve Request (Admin only)
 * PUT /admin/schedule-requests/:id/approve
 */
const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.userID;

        const request = await ScheduleRequest.findById(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Update request status
        request.status = 'approved';
        request.reviewed_by = admin_id;
        request.reviewed_at = new Date();
        await request.save();

        // Update availability with new hours
        await Availability.updateMany(
            { ground_id: request.ground_id },
            {
                opening_time: request.requested_opening,
                closing_time: request.requested_closing,
                custom_hours_approved: true,
                approved_by: admin_id,
                approved_at: new Date()
            }
        );

        res.status(200).json({ message: 'Request approved successfully' });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
};

/**
 * Reject Request (Admin only)
 * PUT /admin/schedule-requests/:id/reject
 */
const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.userID;

        const request = await ScheduleRequest.findById(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        request.status = 'rejected';
        request.reviewed_by = admin_id;
        request.reviewed_at = new Date();
        await request.save();

        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
};

module.exports = {
    getAllUsers,
    getAllGroundsAdmin,
    verifyGround,
    requestHoursChange,
    getPendingRequests,
    approveRequest,
    rejectRequest
};
