const express = require("express");

const router = express.Router();

const {
    registerSchool,
    login,
    getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// REGISTER SCHOOL
// POST /api/auth/register
// ======================================================
router.post(
    "/register",
    registerSchool
);

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================
router.post(
    "/login",
    login
);

// ======================================================
// CURRENT USER PROFILE
// GET /api/auth/profile
// ======================================================
router.get(
    "/profile",
    authMiddleware,
    getProfile
);

module.exports = router;
