const express = require("express");

const router = express.Router();

const {authMiddleware} =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const {
    markAttendance,
    updateAttendance,
    getDailyAttendance,
    getStudentAttendance,
    getAttendanceSummary
} = require("../controllers/attendanceController");


// =======================================
// Authentication
// =======================================
router.use(authMiddleware);


// =======================================
// Daily Attendance
// =======================================
router.get(
    "/daily",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getDailyAttendance
);


// =======================================
// Attendance Summary
// =======================================
router.get(
    "/summary",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getAttendanceSummary
);


// =======================================
// Student Attendance History
// =======================================
router.get(
    "/student/:studentId",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getStudentAttendance
);


// =======================================
// Mark Attendance
// =======================================
router.post(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    markAttendance
);


// =======================================
// Update Attendance
// =======================================
router.put(
    "/:id",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    updateAttendance
);


module.exports = router;
