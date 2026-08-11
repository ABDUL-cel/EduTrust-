const express = require("express");

const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    getParentDashboard,
    getParentChildren,
    getParentChild
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// ======================================================
// PUBLIC
// PARENT REGISTRATION
// ======================================================

router.post(
    "/register",
    registerParent
);


// ======================================================
// PUBLIC
// PARENT LOGIN
// ======================================================

router.post(
    "/login",
    loginParent
);


// ======================================================
// LOGGED-IN PARENT PROFILE
// ======================================================

router.get(
    "/profile",
    authMiddleware,
    getParentProfile
);


// ======================================================
// LOGGED-IN PARENT DASHBOARD
// ======================================================

router.get(
    "/dashboard",
    authMiddleware,
    getParentDashboard
);


// ======================================================
// LOGGED-IN PARENT CHILDREN
// ======================================================

router.get(
    "/children",
    authMiddleware,
    getParentChildren
);


// ======================================================
// LOGGED-IN PARENT SINGLE CHILD
// IMPORTANT: MUST COME BEFORE /:id
// ======================================================

router.get(
    "/children/:studentId",
    authMiddleware,
    getParentChild
);


// ======================================================
// PRINCIPAL / SCHOOL STAFF
// GET ALL PARENTS
// ======================================================

router.get(
    "/",
    authMiddleware,
    getParents
);


// ======================================================
// PRINCIPAL / SCHOOL STAFF
// GET ONE PARENT
// ======================================================

router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports = router;
