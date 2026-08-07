
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getMySchool,
    updateMySchool
} = require("../controllers/schoolController");

// =======================================
// Get school profile
// GET /api/school/profile
// =======================================
router.get(
    "/profile",
    authMiddleware,
    getMySchool
);


// =======================================
// Update school profile
// PUT /api/school/profile
// =======================================
router.put(
    "/profile",
    authMiddleware,
    updateMySchool
);

module.exports = router;

