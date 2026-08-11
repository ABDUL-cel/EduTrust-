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
    getParentChildren
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// ============================================================
// PUBLIC PARENT REGISTRATION
// ============================================================

router.post(
    "/register",
    registerParent
);


// ============================================================
// PUBLIC PARENT LOGIN
// ============================================================

router.post(
    "/login",
    loginParent
);


// ============================================================
// PUBLIC SCHOOL SEARCH
// ============================================================

router.get(
    "/search-schools",
    searchSchools
);


// ============================================================
// LOGGED-IN PARENT PROFILE
// ============================================================

router.get(
    "/profile",
    authMiddleware,
    getParentProfile
);


// ============================================================
// LOGGED-IN PARENT CHILDREN
// ============================================================

router.get(
    "/me/children",
    authMiddleware,
    getParentChildren
);


// ============================================================
// PRINCIPAL: LINK STUDENT TO PARENT
// ============================================================

router.post(
    "/link-student",
    authMiddleware,
    linkStudentToParent
);


// ============================================================
// PRINCIPAL: UNLINK STUDENT FROM PARENT
// ============================================================

router.post(
    "/unlink-student",
    authMiddleware,
    unlinkStudentFromParent
);


// ============================================================
// PRINCIPAL: GET ALL PARENTS
// ============================================================

router.get(
    "/",
    authMiddleware,
    getParents
);


// ============================================================
// PRINCIPAL: GET ONE PARENT
// ============================================================

router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports = router;
