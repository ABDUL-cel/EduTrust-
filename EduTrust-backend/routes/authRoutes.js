
const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// AUTHENTICATION ROUTES
// ======================================================

// Register school + principal
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logged-in user profile
router.get(
    "/profile",
    authMiddleware,
    getMe
);

module.exports = router;
