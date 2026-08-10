const express = require("express");

const router = express.Router();

const {
    getCurrentSchool,
    updateCurrentSchool,
    searchSchools
} = require("../controllers/schoolController");

const authMiddleware =
    require("../middleware/authMiddleware");


// =======================================
// CURRENT SCHOOL
// =======================================

router.get(
    "/current",
    authMiddleware,
    getCurrentSchool
);


// =======================================
// UPDATE SCHOOL
// =======================================

router.put(
    "/current",
    authMiddleware,
    updateCurrentSchool
);


// =======================================
// PUBLIC SCHOOL SEARCH
// =======================================

router.get(
    "/search",
    searchSchools
);


module.exports = router;
