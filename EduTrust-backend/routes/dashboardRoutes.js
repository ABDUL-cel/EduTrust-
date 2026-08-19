const express = require("express");
const router = express.Router();

// 1. DESTRUCTURE authMiddleware WITH CURLY BRACES
const { authMiddleware } = require("../middleware/authMiddleware");

const {
    getDashboardOverview
} = require("../controllers/dashboardController");

// =======================================
// Dashboard Overview
// =======================================
router.get(
    "/overview",
    authMiddleware,
    getDashboardOverview
);

module.exports = router;
