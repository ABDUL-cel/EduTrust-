const express = require('express');
const router = express.Router();
const { 
    uploadResult, 
    checkResultStatus, 
    verifyResultPayment 
} = require('../controllers/resultController');

// Admin/Teacher route to post exam scores
router.post('/upload', uploadResult);

// Student search route
router.post('/check-status', checkResultStatus);

// Payment confirmation route
router.post('/verify-payment', verifyResultPayment);

module.exports = router;const express = require('express');
const router = express.Router();
const { checkResultStatus, verifyResultPayment } = require('../controllers/resultController');

// POST /api/results/check-status
router.post('/check-status', checkResultStatus);

// POST /api/results/verify-payment
router.post('/verify-payment', verifyResultPayment);

module.exports = router;
