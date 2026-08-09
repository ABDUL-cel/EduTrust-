const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe
} = require("../controllers/authController");

const authMiddleware =
    require("../middleware/authMiddleware");

/* =========================
   REGISTER
========================= */

router.post(
    "/register",
    registerUser
);

/* =========================
   LOGIN
========================= */

router.post(
    "/login",
    loginUser
);

/* =========================
   LOGGED-IN PROFILE
========================= */

router.get(
    "/profile",
    authMiddleware,
    getMe
);

module.exports = router;
