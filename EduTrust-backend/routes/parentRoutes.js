const express = require("express");

const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    searchSchools,
    linkStudentToParent,
    unlinkStudentFromParent,
    getMyChildren,
    getMyChild,
    linkParentToUser,
    getParentDashboard
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// ======================================================
// PUBLIC ROUTES
// ======================================================

// Parent registration
router.post(
    "/register",
    registerParent
);


// Parent login lookup
router.post(
    "/login",
    loginParent
);


// School search
router.get(
    "/search-schools",
    searchSchools
);


// ======================================================
// LOGGED-IN PARENT ROUTES
// ======================================================

// Parent profile
router.get(
    "/profile",
    authMiddleware,
    getParentProfile
);


// Parent dashboard
router.get(
    "/dashboard",
    authMiddleware,
    getParentDashboard
);


// Parent's children
router.get(
    "/my-children",
    authMiddleware,
    getMyChildren
);


// One child
router.get(
    "/my-children/:studentId",
    authMiddleware,
    getMyChild
);


// ======================================================
// SCHOOL / PRINCIPAL ROUTES
// ======================================================

// Get all parents
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


// ======================================================
// PARENT ↔ STUDENT LINKING
// ======================================================

// Link student to parent
router.post(
    "/link-student",
    authMiddleware,
    linkStudentToParent
);


// Unlink student
router.post(
    "/unlink-student",
    authMiddleware,
    unlinkStudentFromParent
);


// ======================================================
// USER ↔ PARENT LINKING
// ======================================================

// Link User account to Parent record
router.post(
    "/link-user",
    authMiddleware,
    linkParentToUser
);


module.exports = router;
