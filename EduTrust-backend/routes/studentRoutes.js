const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    registerStudent,
    getAllStudents,
    getStudentById,
    getPendingStudents,
    getActiveStudents,
    getSuspendedStudents,
    getGraduatedStudents,
    getArchivedStudents,
    approveStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent
} = require("../controllers/studentController");


// ======================================================
// ALL STUDENT ROUTES REQUIRE LOGIN
// ======================================================
router.use(authMiddleware);


// ======================================================
// REGISTER STUDENT
// POST /api/students/register
// ======================================================
router.post(
    "/register",
    registerStudent
);


// ======================================================
// GET ALL STUDENTS
// GET /api/students
// ======================================================
router.get(
    "/",
    getAllStudents
);


// ======================================================
// GET PENDING STUDENTS
// GET /api/students/pending
// ======================================================
router.get(
    "/pending",
    getPendingStudents
);


// ======================================================
// GET ACTIVE STUDENTS
// GET /api/students/active
// ======================================================
router.get(
    "/active",
    getActiveStudents
);


// ======================================================
// GET SUSPENDED STUDENTS
// GET /api/students/suspended
// ======================================================
router.get(
    "/suspended",
    getSuspendedStudents
);


// ======================================================
// GET GRADUATED STUDENTS
// GET /api/students/graduated
// ======================================================
router.get(
    "/graduated",
    getGraduatedStudents
);


// ======================================================
// GET ARCHIVED STUDENTS
// GET /api/students/archived
// ======================================================
router.get(
    "/archived",
    getArchivedStudents
);


// ======================================================
// APPROVE STUDENT
// PATCH /api/students/:id/approve
// ======================================================
router.patch(
    "/:id/approve",
    approveStudent
);


// ======================================================
// SUSPEND STUDENT
// PATCH /api/students/:id/suspend
// ======================================================
router.patch(
    "/:id/suspend",
    suspendStudent
);


// ======================================================
// REINSTATE STUDENT
// PATCH /api/students/:id/reinstate
// ======================================================
router.patch(
    "/:id/reinstate",
    reinstateStudent
);


// ======================================================
// GRADUATE STUDENT
// PATCH /api/students/:id/graduate
// ======================================================
router.patch(
    "/:id/graduate",
    graduateStudent
);


// ======================================================
// ARCHIVE STUDENT
// PATCH /api/students/:id/archive
// ======================================================
router.patch(
    "/:id/archive",
    archiveStudent
);


// ======================================================
// GET SINGLE STUDENT
// GET /api/students/:id
// ======================================================
router.get(
    "/:id",
    getStudentById
);


// ======================================================
// EXPORT
// ======================================================
module.exports = router;
