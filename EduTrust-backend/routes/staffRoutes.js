
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

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
// Staff Management
// =======================================

// Principal only
router.post(
    "/",
    roleMiddleware("Principal"),
    createStaff
);


// Principal only
router.get(
    "/",
    roleMiddleware("Principal"),
    getStaff
);


// Principal only
router.get(
    "/:id",
    roleMiddleware("Principal"),
    getStaffMember
);


// Principal only
router.patch(
    "/:id/suspend",
    roleMiddleware("Principal"),
    suspendStaff
);


// Principal only
router.patch(
    "/:id/activate",
    roleMiddleware("Principal"),
    activateStaff
);


module.exports = router;
