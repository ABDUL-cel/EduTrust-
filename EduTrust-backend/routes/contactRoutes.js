const express = require('express');
const router = express.Router();
const { submitContactForm, getInquiries } = require('../controllers/contactController');

// POST /api/contact -> Public submission
router.post('/', submitContactForm);

// GET /api/contact -> List all inquiries
router.get('/', getInquiries);

module.exports = router;
