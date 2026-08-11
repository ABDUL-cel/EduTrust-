const express = require("express");

const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    assignParentToStudent,
    removeParentFromStudent,
    getStudentParent,
    getParentChildren,
    getParentDashboard
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// =====================================================
// PUBLIC
// =====================================================

// Parent registration
router.post(
    "/register",
    registerParent
);

// Parent login
router.post(
    "/login",
    loginParent
);


// =====================================================
// LOGGED-IN PARENT
// =====================================================

// Parent dashboard
router.get(
    "/me/dashboard",
    authMiddleware,
    getParentDashboard
);

// Parent profile
router.get(
    "/me/profile",
    authMiddleware,
    getParentProfile
);

// Parent's children
router.get(
    "/me/children",
    authMiddleware,
    getParentChildren
);


// =====================================================
// SCHOOL / PRINCIPAL PARENT MANAGEMENT
// =====================================================

// Get all parents in school
router.get(
    "/",
    authMiddleware,
    getParents
);

// Get one parent
router.get(
    "/:id",
    authMiddleware,
    getParentById
);


// =====================================================
// STUDENT ↔ PARENT LINKING
// =====================================================

// Assign parent to student
router.post(
    "/assign-student",
    authMiddleware,
    assignParentToStudent
);

// Remove parent from student
router.delete(
    "/student/:studentId",
    authMiddleware,
    removeParentFromStudent
);

// Get student's parent
router.get(
    "/student/:studentId",
    authMiddleware,
    getStudentParent
);


module.exports = router;
