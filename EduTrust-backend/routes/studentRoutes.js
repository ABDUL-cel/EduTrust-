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

const {
    authMiddleware,
    authorizeRoles
} = require("../middleware/authMiddleware");

// =====================================================
// ADMIN ROLES
// =====================================================

const ADMIN_ROLES = [
    "admin",
    "superadmin",
    "schooladmin"
];

// =====================================================
// RATE LIMITERS
// =====================================================

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many accounts created from this IP. Please try again after an hour."
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many login attempts from this IP. Please try again after 15 minutes."
    }
});

// =====================================================
// PUBLIC ROUTES
// =====================================================

router.post(
    "/register",
    registrationLimiter,
    registerStudent
);

router.post(
    "/login",
    loginLimiter,
    loginStudent
);

// =====================================================
// AUTHENTICATED STUDENT SELF ROUTES
// IMPORTANT:
// These must appear before /:id routes.
// =====================================================

router.get(
    "/me/profile",
    authMiddleware,
    authorizeRoles(
        "student",
        ...ADMIN_ROLES
    ),
    getStudentProfile
);

router.get(
    "/me/dashboard",
    authMiddleware,
    authorizeRoles(
        "student",
        ...ADMIN_ROLES
    ),
    getStudentDashboardData
);

// =====================================================
// ADMIN / STAFF STUDENT LIST ROUTES
// =====================================================

router.get(
    "/",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES,
        "teacher",
        "accountant"
    ),
    getStudents
);

router.get(
    "/pending",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES,
        "teacher"
    ),
    getPendingStudents
);

router.get(
    "/active",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES,
        "teacher",
        "accountant"
    ),
    getActiveStudents
);

// =====================================================
// PARENT / STUDENT RELATIONSHIP
// =====================================================

router.get(
    "/:id/parent",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES,
        "teacher",
        "parent"
    ),
    getStudentParent
);

router.patch(
    "/:id/parent",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    linkParentToStudent
);

router.delete(
    "/:id/parent",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    unlinkParentFromStudent
);

// =====================================================
// STUDENT APPROVAL
// =====================================================

router.patch(
    "/:id/approve",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    approveStudent
);

// =====================================================
// STUDENT REJECTION
// =====================================================

router.patch(
    "/:id/reject",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    rejectStudent
);

// =====================================================
// STUDENT SUSPENSION
// =====================================================

router.patch(
    "/:id/suspend",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    suspendStudent
);

// =====================================================
// STUDENT REINSTATEMENT
// =====================================================

router.patch(
    "/:id/reinstate",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    reinstateStudent
);

// =====================================================
// STUDENT GRADUATION
// =====================================================

router.patch(
    "/:id/graduate",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    graduateStudent
);

// =====================================================
// STUDENT ARCHIVING
// =====================================================

router.patch(
    "/:id/archive",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    archiveStudent
);

// =====================================================
// GET SINGLE STUDENT
// =====================================================

router.get(
    "/:id",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES,
        "teacher"
    ),
    getStudent
);

// =====================================================
// UPDATE STUDENT
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    updateStudent
);

// =====================================================
// DELETE STUDENT
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles(
        ...ADMIN_ROLES
    ),
    deleteStudent
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;
