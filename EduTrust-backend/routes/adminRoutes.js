const express = require('express');
const router = express.Router();

// Controllers
const {
    getDashboardStats,
    submitContactForm,
    getAllInquiries,
    updateInquiryStatus
} = require('../controllers/adminController');

const { loginAdmin, seedSuperAdmin } = require('../controllers/adminAuthController');

// Middleware
const { protectAdmin } = require('../middleware/authMiddleware');

// ==========================================
// 1. PUBLIC ROUTES (No Token Needed)
// ==========================================

// Contact form submission from landing page / contact.html
router.post('/contact', submitContactForm);

// Super Admin login & initial seed setup
router.post('/admin/login', loginAdmin);
router.post('/admin/seed', seedSuperAdmin); // Run once to create initial admin account


// ==========================================
// 2. PROTECTED SUPER ADMIN ROUTES (Token Required)
// ==========================================

// Any route listed below requires 'Authorization: Bearer <token>' header
router.use('/admin', protectAdmin);

router.get('/admin/dashboard-stats', getDashboardStats);
router.get('/admin/inquiries', getAllInquiries);
router.patch('/admin/inquiries/:id/status', updateInquiryStatus);

module.exports = router;
