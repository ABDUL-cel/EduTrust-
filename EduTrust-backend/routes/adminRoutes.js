const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    submitContactForm,
    getAllInquiries,
    updateInquiryStatus
} = require('../controllers/adminController');

// Public route for form submission
router.post('/contact', submitContactForm);

// Super Admin protected routes
// Note: You can attach your auth middleware (e.g., protect, authorize('superadmin')) here
router.get('/admin/dashboard-stats', getDashboardStats);
router.get('/admin/inquiries', getAllInquiries);
router.patch('/admin/inquiries/:id/status', updateInquiryStatus);

module.exports = router;
