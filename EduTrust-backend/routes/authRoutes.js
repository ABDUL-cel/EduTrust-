const express = require("express");

const router = express.Router();

const {
    registerSchool,
    login,
    getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", registerSchool);

// Login
router.post("/login", login);

// Get Logged-in User
router.get("/profile", authMiddleware, getProfile);

module.exports = router;