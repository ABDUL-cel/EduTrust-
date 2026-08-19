const express = require('express');
const router = express.Router();

// Controllers
const {
    getDashboardStats,
    submitContactForm,
    getAllInquiries,
    updateInquiryStatus
} = require('../controllers/adminController');

const { loginAdmin, seedSuperAdmin } = require('../controllers/authController');

// Middleware
const { protectAdmin } = require('../middleware/authMiddleware');

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
router.post('/contact', submitContactForm);
router.post('/admin/login', loginAdmin);
router.post('/admin/seed', seedSuperAdmin);

// ==========================================
// 2. PROTECTED ROUTES
// ==========================================
router.use('/admin', protectAdmin); // Protects all /admin sub-routes below

router.get('/admin/dashboard-stats', getDashboardStats);
router.get('/admin/inquiries', getAllInquiries);
router.patch('/admin/inquiries/:id/status', updateInquiryStatus);

module.exports = router;
