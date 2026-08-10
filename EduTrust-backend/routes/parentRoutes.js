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

const authMiddleware = require("../middleware/authMiddleware");


// =======================================
// PARENT SELF-REGISTRATION
// Public
// Parent selects school during registration
// =======================================

router.post(
    "/register",
    registerParent
);


// =======================================
// PARENT LOGIN
// Public
// =======================================

router.post(
    "/login",
    loginParent
);


// =======================================
// PUBLIC SCHOOL SEARCH
// Used before parent registration
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
// PRINCIPAL - GET ALL PARENTS
// Only parents belonging to the
// principal's school should be returned.
// =======================================

router.get(
    "/",
    authMiddleware,
    getParents
);


// =======================================
// PRINCIPAL - GET ONE PARENT
// =======================================

router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports = router;const express = require("express");
const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");

// Public / Auth routes
router.post("/register", authMiddleware, registerParent);
router.post("/login", loginParent);
router.get("/profile", authMiddleware, getParentProfile);

// Dashboard management routes (For Principal / Admin)
router.get("/", authMiddleware, getParents);
router.get("/:id", authMiddleware, getParentById);

module.exports = router;
