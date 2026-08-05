const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get Logged-in User
router.get("/profile", authMiddleware, getMe);

module.exports = router;
