const express = require("express");

const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    searchSchools,
    getParentDashboard,
    getParentChildren,
    getParentChildById,
    linkStudentToParent,
    unlinkStudentFromParent
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// ======================================================
// PUBLIC PARENT REGISTRATION
// ======================================================

router.post(
    "/register",
    registerParent
);


// ======================================================
// PUBLIC PARENT LOGIN LOOKUP
// ======================================================

router.post(
    "/login",
    loginParent
);


// ======================================================
// PUBLIC SCHOOL SEARCH
// ======================================================

router.get(
    "/search-schools",
    searchSchools
);


// ======================================================
// PARENT DASHBOARD
// IMPORTANT: KEEP THIS BEFORE /:id
// ======================================================

router.get(
    "/dashboard",
    authMiddleware,
    getParentDashboard
);


// ======================================================
// PARENT PROFILE
// ======================================================

router.get(
    "/profile",
    authMiddleware,
    getParentProfile
);


// ======================================================
// PARENT CHILDREN
// ======================================================

router.get(
    "/children",
    authMiddleware,
    getParentChildren
);


// ======================================================
// ONE CHILD
// ======================================================

router.get(
    "/children/:studentId",
    authMiddleware,
    getParentChildById
);


// ======================================================
// PRINCIPAL: GET ALL PARENTS
// ======================================================

router.get(
    "/",
    authMiddleware,
    getParents
);


// ======================================================
// PRINCIPAL: LINK STUDENT TO PARENT
// ======================================================

router.patch(
    "/link-student",
    authMiddleware,
    linkStudentToParent
);


// ======================================================
// PRINCIPAL: UNLINK STUDENT FROM PARENT
// ======================================================

router.patch(
    "/unlink-student/:studentId",
    authMiddleware,
    unlinkStudentFromParent
);


// ======================================================
// PRINCIPAL: GET ONE PARENT
// IMPORTANT: KEEP THIS LAST
// ======================================================

router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports = router;
