
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createStaff,
    getStaff,
    getStaffMember,
    suspendStaff,
    activateStaff
} = require("../controllers/staffController");


// =======================================
// Authentication
// =======================================
router.use(authMiddleware);


// =======================================
// Staff
// =======================================

// Create staff
router.post("/", createStaff);

// Get all staff
router.get("/", getStaff);

// Get one staff member
router.get("/:id", getStaffMember);

// Suspend staff
router.patch("/:id/suspend", suspendStaff);

// Activate staff
router.patch("/:id/activate", activateStaff);


module.exports = router;
