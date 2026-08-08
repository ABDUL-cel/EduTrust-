
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getCurrentSchool,
    updateCurrentSchool
} = require("../controllers/schoolController");


// =======================================
// All school routes require authentication
// =======================================
router.use(authMiddleware);


// =======================================
// Current School
// =======================================

// GET /api/school
router.get("/", getCurrentSchool);


// PUT /api/school
router.put("/", updateCurrentSchool);


module.exports = router;
