const express = require("express");
const router = express.Router();

const {
    getCurrentSchool,
    updateCurrentSchool
} = require("../controllers/schoolController");

const authMiddleware = require("../middleware/authMiddleware");

// =======================================
// GET CURRENT SCHOOL
// =======================================
router.get(
    "/current",
    authMiddleware,
    getCurrentSchool
);

// =======================================
// UPDATE CURRENT SCHOOL
// =======================================
router.put(
    "/current",
    authMiddleware,
    updateCurrentSchool
);

module.exports = router;
