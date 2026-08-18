const express = require("express");

const router = express.Router();

const {
    registerSchool,
    login,
    getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// REGISTER SCHOOL + PRINCIPAL
// POST /api/auth/register
// ======================================================

router.post("/register", registerSchool);
router.post("/register-staff", staffController.registerStaff); // <-- Use staffController
// ======================================================
// LOGIN PRINCIPAL / USER
// POST /api/auth/login
// ======================================================

router.post("/login", login);

// ======================================================
// GET CURRENT LOGGED-IN USER
// GET /api/auth/profile
// ======================================================

router.get("/profile", authMiddleware, getProfile);

module.exports = router;
