// Admin Routes
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getAllUsers,
    getAllGroundsAdmin,
    verifyGround
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// GET /admin/users - Get all users
router.get('/users', getAllUsers);

// GET /admin/grounds - Get all grounds
router.get('/grounds', getAllGroundsAdmin);

// PUT /admin/grounds/:id/verify - Verify ground
router.put('/grounds/:id/verify', verifyGround);

// GET /admin/schedule-requests - Get pending requests
router.get('/schedule-requests', getPendingRequests);

// PUT /admin/schedule-requests/:id/approve - Approve request
router.put('/schedule-requests/:id/approve', approveRequest);

// PUT /admin/schedule-requests/:id/reject - Reject request
router.put('/schedule-requests/:id/reject', rejectRequest);

module.exports = router;
