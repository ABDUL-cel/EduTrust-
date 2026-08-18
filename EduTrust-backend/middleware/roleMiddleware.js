const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const staffController = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================================
// PUBLIC AUTH ROUTES
// ======================================================

router.post("/register-school", authController.registerSchool);
router.post("/register-staff", staffController.registerStaff); // Fix: use staffController
router.post("/login", authController.login);

// ======================================================
// PROTECTED PRINCIPAL ROUTES (APPROVAL FLOW)
// ======================================================

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
