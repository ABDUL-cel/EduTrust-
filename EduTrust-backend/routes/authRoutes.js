const express = require("express");
const router = express.Router();

// 1. Import authController functions
const {
    registerSchool,
    login,
    getProfile
} = require("../controllers/authController");

// 2. Import staffController for staff registration
const staffController = require("../controllers/staffController");

// 3. DESTRUCTURE authMiddleware HERE (Line 13)
const { authMiddleware } = require("../middleware/authMiddleware");

// ======================================================
// REGISTER SCHOOL + PRINCIPAL & STAFF
// ======================================================

router.post("/register", registerSchool);
router.post("/register-staff", staffController.registerStaff);

// ======================================================
// LOGIN PRINCIPAL / USER
// POST /api/auth/login
// ======================================================

router.post("/login", login);

// ======================================================
// GET CURRENT LOGGED-IN USER
// GET /api/auth/profile
// ======================================================

// Line 36: authMiddleware is now a valid middleware function!
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
