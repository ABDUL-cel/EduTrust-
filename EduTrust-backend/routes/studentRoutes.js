
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerStudent,
    getStudents,
    getStudent,
    approveStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent
} = require("../controllers/studentController");


// =======================================
// Register student
// POST /api/students
// =======================================
router.post(
    "/",
    authMiddleware,
    registerStudent
);


// =======================================
// Get students
// GET /api/students
//
// Optional:
// ?status=Pending
// ?status=Active
// ?class_name=JSS1
// ?search=John
// =======================================
router.get(
    "/",
    authMiddleware,
    getStudents
);


// =======================================
// Get single student
// GET /api/students/:id
// =======================================
router.get(
    "/:id",
    authMiddleware,
    getStudent
);


// =======================================
// Approve student
// PATCH /api/students/:id/approve
// =======================================
router.patch(
    "/:id/approve",
    authMiddleware,
    approveStudent
);


// =======================================
// Suspend student
// PATCH /api/students/:id/suspend
// =======================================
router.patch(
    "/:id/suspend",
    authMiddleware,
    suspendStudent
);


// =======================================
// Reinstate student
// PATCH /api/students/:id/reinstate
// =======================================
router.patch(
    "/:id/reinstate",
    authMiddleware,
    reinstateStudent
);


// =======================================
// Graduate student
// PATCH /api/students/:id/graduate
// =======================================
router.patch(
    "/:id/graduate",
    authMiddleware,
    graduateStudent
);


// =======================================
// Archive student
// PATCH /api/students/:id/archive
// =======================================
router.patch(
    "/:id/archive",
    authMiddleware,
    archiveStudent
);


module.exports = router;
