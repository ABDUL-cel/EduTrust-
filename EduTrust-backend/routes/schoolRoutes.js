
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getCurrentSchool,
    updateCurrentSchool
} = require("../controllers/schoolController");


// =======================================
// Authentication
// =======================================
router.use(authMiddleware);


// =======================================
// View School
// =======================================
router.get(
    "/",
    getCurrentSchool
);


// =======================================
// Update School
// Principal only
// =======================================
router.put(
    "/",
    roleMiddleware("Principal"),
    updateCurrentSchool
);


module.exports = router;
