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

// =====================================================
// RATE LIMITERS
// =====================================================

// Registration limiter: Max 5 registrations per hour per IP
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

// Login limiter: Max 10 attempts per 15 minutes to prevent brute-force attacks
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
// PUBLIC ROUTES
// =====================================================

// Student Registration
router.post(
    "/register",
    registrationLimiter,
    registerStudent
);

// Student Login
router.post(
    "/login",
    loginLimiter,
    loginStudent
);

// =====================================================
// LOGGED-IN STUDENT PROFILE & DASHBOARD
// (Accessible by authenticated Students)
// =====================================================
router.get(
    "/me/profile",
    authMiddleware,
    authorizeRoles("student", "admin", "superadmin"),
    getStudentProfile
);

router.get(
    "/me/dashboard",
    authMiddleware,
    authorizeRoles("student", "admin", "superadmin"),
    getStudentDashboardData
);

// =====================================================
// FILTERED & BULK STUDENT LISTS
// (Accessible by Admin / School Staff)
// =====================================================
router.get(
    "/",
    authMiddleware,
    authorizeRoles("admin", "superadmin", "teacher", "accountant"),
    getStudents
);

router.get(
    "/pending",
    authMiddleware,
    authorizeRoles("admin", "superadmin", "teacher"),
    getPendingStudents
);

router.get(
    "/active",
    authMiddleware,
    authorizeRoles("admin", "superadmin", "teacher", "accountant"),
    getActiveStudents
);

// =====================================================
// PARENT-STUDENT LINKING
// =====================================================
router.get(
    "/:id/parent",
    authMiddleware,
    authorizeRoles("admin", "superadmin", "teacher", "parent"),
    getStudentParent
);

router.patch(
    "/:id/parent",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    linkParentToStudent
);

router.delete(
    "/:id/parent",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    unlinkParentFromStudent
);

// =====================================================
// STUDENT LIFECYCLE MANAGEMENT (ADMIN / SUPERADMIN ONLY)
// =====================================================
router.patch(
    "/:id/approve",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    approveStudent
);

router.patch(
    "/:id/reject",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    rejectStudent
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    updateStudent
);

router.patch(
    "/:id/suspend",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    suspendStudent
);

router.patch(
    "/:id/reinstate",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    reinstateStudent
);

router.patch(
    "/:id/graduate",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    graduateStudent
);

router.patch(
    "/:id/archive",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    archiveStudent
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("admin", "superadmin"),
    deleteStudent
);

// =====================================================
// GET SINGLE STUDENT
// =====================================================
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("admin", "superadmin", "teacher"),
    getStudent
);

module.exports = router;
