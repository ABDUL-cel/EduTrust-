const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
    registerStudent,
    getStudents,
    getStudent,
    getPendingStudents,
    getActiveStudents,
    approveStudent,
    updateStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent,
    deleteStudent,
    linkParentToStudent,
    unlinkParentFromStudent,
    getStudentParent,
    getStudentProfile,
    getStudentDashboardData
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");

// Rate limiter: Max 5 registrations per hour per IP address
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: "Too many accounts created from this IP. Please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// =====================================================
// REGISTER STUDENT (PUBLIC ACCESS + RATE LIMITED)
// =====================================================
router.post(
    "/",
    registrationLimiter,
    registerStudent
);

// =====================================================
// LOGGED-IN STUDENT PROFILE & DASHBOARD
// =====================================================
router.get(
    "/me/profile",
    authMiddleware,
    getStudentProfile
);

router.get(
    "/me/dashboard",
    authMiddleware,
    getStudentDashboardData
);

// =====================================================
// FILTERED & BULK STUDENT LISTS
// =====================================================
router.get(
    "/",
    authMiddleware,
    getStudents
);

router.get(
    "/pending",
    authMiddleware,
    getPendingStudents
);

router.get(
    "/active",
    authMiddleware,
    getActiveStudents
);

// =====================================================
// PARENT-STUDENT LINKING (BEFORE /:id)
// =====================================================
router.get(
    "/:id/parent",
    authMiddleware,
    getStudentParent
);

router.patch(
    "/:id/parent",
    authMiddleware,
    linkParentToStudent
);

router.delete(
    "/:id/parent",
    authMiddleware,
    unlinkParentFromStudent
);

// =====================================================
// STUDENT LIFECYCLE MANAGEMENT
// =====================================================
router.patch(
    "/:id/approve",
    authMiddleware,
    approveStudent
);

router.put(
    "/:id",
    authMiddleware,
    updateStudent
);

router.patch(
    "/:id/suspend",
    authMiddleware,
    suspendStudent
);

router.patch(
    "/:id/reinstate",
    authMiddleware,
    reinstateStudent
);

router.patch(
    "/:id/graduate",
    authMiddleware,
    graduateStudent
);

router.patch(
    "/:id/archive",
    authMiddleware,
    archiveStudent
);

router.delete(
    "/:id",
    authMiddleware,
    deleteStudent
);

// =====================================================
// GET SINGLE STUDENT (MUST REMAIN AT THE BOTTOM)
// =====================================================
router.get(
    "/:id",
    authMiddleware,
    getStudent
);

module.exports = router;
