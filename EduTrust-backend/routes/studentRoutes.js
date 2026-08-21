const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
    registerStudent,
    loginStudent,
    getStudents,
    getStudent,
    getPendingStudents,
    getActiveStudents,
    approveStudent,
    rejectStudent,
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

// Import Auth and Role Authorization Middlewares
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// Common Admin Roles Helper Array
const ADMIN_ROLES = ["admin", "superadmin", "schooladmin"];

// =====================================================
// RATE LIMITERS
// =====================================================

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

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: "Too many login attempts from this IP. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// =====================================================
// 1. PUBLIC ROUTES
// =====================================================

router.post("/register", registrationLimiter, registerStudent);
router.post("/login", loginLimiter, loginStudent);

// =====================================================
// 2. STATIC AUTHENTICATED ROUTES (Must come before /:id)
// =====================================================

// Student Self Routes
router.get(
    "/me/profile",
    authMiddleware,
    authorizeRoles("student", ...ADMIN_ROLES),
    getStudentProfile
);

router.get(
    "/me/dashboard",
    authMiddleware,
    authorizeRoles("student", ...ADMIN_ROLES),
    getStudentDashboardData
);

// Admin & Staff Lists
router.get(
    "/",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES, "teacher", "accountant"),
    getStudents
);

router.get(
    "/pending",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES, "teacher"),
    getPendingStudents
);

router.get(
    "/active",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES, "teacher", "accountant"),
    getActiveStudents
);

// =====================================================
// 3. PARAMETERIZED ROUTES (/:id)
// =====================================================

// Parent-Student Linking
router.get(
    "/:id/parent",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES, "teacher", "parent"),
    getStudentParent
);

router.patch(
    "/:id/parent",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    linkParentToStudent
);

router.delete(
    "/:id/parent",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    unlinkParentFromStudent
);

// Student Lifecycle Actions
router.patch(
    "/:id/approve",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    approveStudent
);

router.patch(
    "/:id/reject",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    rejectStudent
);

router.patch(
    "/:id/suspend",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    suspendStudent
);

router.patch(
    "/:id/reinstate",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    reinstateStudent
);

router.patch(
    "/:id/graduate",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    graduateStudent
);

router.patch(
    "/:id/archive",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    archiveStudent
);

// Single Student CRUD
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES, "teacher"),
    getStudent
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    updateStudent
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles(...ADMIN_ROLES),
    deleteStudent
);

module.exports = router;
