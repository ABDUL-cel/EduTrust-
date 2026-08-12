// routes/parentRoutes.js

const express =
    require("express");

const router =
    express.Router();

const {

    registerParent,

    loginParent,

    searchSchools,

    getParentProfile,

    getParents,

    getParentById,

    getParentDashboard

} =
    require(
        "../controllers/parentController"
    );

const authMiddleware =
    require(
        "../middleware/authMiddleware"
    );


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
// PARENT DASHBOARD
// ============================================================

router.get(
    "/dashboard",
    authMiddleware,
    getParentDashboard
);


// ============================================================
// PARENT PROFILE
// ============================================================

router.get(
    "/profile",
    authMiddleware,
    getParentProfile
);


// ============================================================
// SCHOOL PARENTS
// PRINCIPAL / STAFF
// ============================================================

router.get(
    "/",
    authMiddleware,
    getParents
);


// ============================================================
// SINGLE PARENT
// ============================================================

router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports =
    router;
