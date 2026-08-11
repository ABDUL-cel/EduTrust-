const express = require("express");

const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    searchSchools
} = require("../controllers/parentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// =======================================
// PARENT SELF-REGISTRATION
// PUBLIC
// =======================================

router.post(
    "/register",
    registerParent
);


// =======================================
// PARENT LOGIN
// PUBLIC
// =======================================

router.post(
    "/login",
    loginParent
);


// =======================================
// SEARCH SCHOOLS
// PUBLIC
// =======================================

router.get(
    "/search-schools",
    searchSchools
);


// =======================================
// LOGGED-IN PARENT PROFILE
// =======================================

router.get(
    "/profile",
    authMiddleware,
    getParentProfile
);


// =======================================
// PRINCIPAL:
// GET ALL PARENTS FOR SCHOOL
// =======================================

router.get(
    "/",
    authMiddleware,
    getParents
);


// =======================================
// PRINCIPAL:
// GET ONE PARENT
// =======================================

router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports = router;
