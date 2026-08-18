const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const staffController = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public Auth Routes
router.post("/register-school", authController.registerSchool);
router.post("/register-staff", authController.registerStaff);
router.post("/login", authController.login);

// Protected Principal Routes (Approval Flow)
router.get(
    "/principal/pending-staff",
    authMiddleware,
    roleMiddleware("Principal", "SuperAdmin"),
    staffController.getPendingStaff
);

router.patch(
    "/principal/approve-staff/:staff_id",
    authMiddleware,
    roleMiddleware("Principal", "SuperAdmin"),
    staffController.approveStaff
);

router.delete(
    "/principal/reject-staff/:staff_id",
    authMiddleware,
    roleMiddleware("Principal", "SuperAdmin"),
    staffController.rejectStaff
);

module.exports = router;
