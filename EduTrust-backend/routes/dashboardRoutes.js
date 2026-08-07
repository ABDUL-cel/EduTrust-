const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getDashboardOverview
} = require("../controllers/dashboardController");

// =======================================
// Dashboard Overview
// GET /api/dashboard/overview
// =======================================
router.get(
    "/overview",
    authMiddleware,
    getDashboardOverview
);

module.exports = router;
