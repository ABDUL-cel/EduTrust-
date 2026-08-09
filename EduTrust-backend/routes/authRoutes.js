
const express = require("express");

const router = express.Router();

const {
    registerSchool,
    loginUser,
    getMe
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// SCHOOL / PRINCIPAL REGISTRATION
// ======================================================

router.post(
    "/register",
    registerSchool
);

// ======================================================
// LOGIN
// ======================================================

router.post(
    "/login",
    loginUser
);

// ======================================================
// LOGGED-IN USER PROFILE
// ======================================================

router.get(
    "/profile",
    authMiddleware,
    getMe
);

module.exports = router;
