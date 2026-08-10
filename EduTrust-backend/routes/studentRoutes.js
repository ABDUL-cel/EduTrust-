const express = require("express");

const router = express.Router();

const {
    registerStudent,
    getStudents,
    getStudent,
    getPendingStudents,
    getActiveStudents,
    approveStudent,
    updateStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent,
    deleteStudent,
    getStudentProfile,
    getStudentDashboardData,
    searchSchools
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");


// =======================================
// STUDENT ROUTES
// =======================================

// Register student
router.post(
    "/",
    authMiddleware,
    registerStudent
);


// =======================================
// LOGGED-IN STUDENT PROFILE
// =======================================

router.get(
    "/me/profile",
    authMiddleware,
    getStudentProfile
);


// =======================================
// LOGGED-IN STUDENT DASHBOARD
// =======================================

router.get(
    "/me/dashboard",
    authMiddleware,
    getStudentDashboardData
);


// =======================================
// GET ALL STUDENTS
// =======================================

router.get(
    "/",
    authMiddleware,
    getStudents
);


// =======================================
// GET PENDING STUDENTS
// =======================================

router.get(
    "/pending",
    authMiddleware,
    getPendingStudents
);


// =======================================
// GET ACTIVE STUDENTS
// =======================================

router.get(
    "/active",
    authMiddleware,
    getActiveStudents
);


// =======================================
// GET ONE STUDENT
// =======================================

router.get(
    "/:id",
    authMiddleware,
    getStudent
);


// =======================================
// APPROVE STUDENT
// =======================================

router.patch(
    "/:id/approve",
    authMiddleware,
    approveStudent
);


// =======================================
// UPDATE STUDENT
// =======================================

router.put(
    "/:id",
    authMiddleware,
    updateStudent
);


// =======================================
// SUSPEND STUDENT
// =======================================

router.patch(
    "/:id/suspend",
    authMiddleware,
    suspendStudent
);


// =======================================
// REINSTATE STUDENT
// =======================================

router.patch(
    "/:id/reinstate",
    authMiddleware,
    reinstateStudent
);


// =======================================
// GRADUATE STUDENT
// =======================================

router.patch(
    "/:id/graduate",
    authMiddleware,
    graduateStudent
);


// =======================================
// ARCHIVE STUDENT
// =======================================

router.patch(
    "/:id/archive",
    authMiddleware,
    archiveStudent
);


// =======================================
// PERMANENTLY DELETE STUDENT
// =======================================

router.delete(
    "/:id",
    authMiddleware,
    deleteStudent
);
// =======================================
// PUBLIC SCHOOL SEARCH
// =======================================

router.get(
    "/search",
    searchSchools
);


module.exports = router;
