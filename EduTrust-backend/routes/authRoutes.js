
const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// REGISTER SCHOOL + PRINCIPAL
// ======================================================

router.post(
    "/register",
    authController.registerSchool
);

// ======================================================
// LOGIN
// ======================================================

router.post(
    "/login",
    authController.loginUser
);

// ======================================================
// CURRENT USER PROFILE
// ======================================================

router.get(
    "/profile",
    authMiddleware,
    authController.getMe
);

module.exports = router;
