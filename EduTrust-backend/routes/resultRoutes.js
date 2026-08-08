
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createResult,
    updateResult,
    submitResult,
    publishResult,
    getStudentResults,
    getSchoolResults
} = require("../controllers/resultController");


// =======================================
// Authentication
// =======================================
router.use(authMiddleware);


// =======================================
// Get School Results
// Principal / Vice Principal / Teacher
// =======================================
router.get(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getSchoolResults
);


// =======================================
// Get Student Results
// =======================================
router.get(
    "/student/:studentId",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getStudentResults
);


// =======================================
// Create Result
// =======================================
router.post(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    createResult
);


// =======================================
// Update Result
// =======================================
router.put(
    "/:id",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    updateResult
);


// =======================================
// Submit Result
// =======================================
router.patch(
    "/:id/submit",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    submitResult
);


// =======================================
// Publish Result
// Principal / Vice Principal only
// =======================================
router.patch(
    "/:id/publish",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    publishResult
);


module.exports = router;
