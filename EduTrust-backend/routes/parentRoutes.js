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
    getMyChild
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// ======================================================
// PUBLIC
// ======================================================

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

// Search schools
router.get(
    "/search-schools",
    searchSchools
);


// ======================================================
// LOGGED-IN PARENT
// ======================================================

// Parent profile
router.get(
    "/profile",
    authMiddleware,
    getParentProfile
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
// SCHOOL / PRINCIPAL
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
// LINKING
// ======================================================

// Link student to parent
router.post(
    "/link-student",
    authMiddleware,
    linkStudentToParent
);

// Unlink student from parent
router.post(
    "/unlink-student",
    authMiddleware,
    unlinkStudentFromParent
);


module.exports = router;
