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
    deleteStudent
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

// Get all students
router.get(
    "/",
    authMiddleware,
    getStudents
);

// Get pending students
router.get(
    "/pending",
    authMiddleware,
    getPendingStudents
);

// Get active students
router.get(
    "/active",
    authMiddleware,
    getActiveStudents
);

// Get one student
router.get(
    "/:id",
    authMiddleware,
    getStudent
);

// Approve student
router.patch(
    "/:id/approve",
    authMiddleware,
    approveStudent
);

// Update student
router.put(
    "/:id",
    authMiddleware,
    updateStudent
);

// Suspend student
router.patch(
    "/:id/suspend",
    authMiddleware,
    suspendStudent
);

// Reinstate student
router.patch(
    "/:id/reinstate",
    authMiddleware,
    reinstateStudent
);

// Graduate student
router.patch(
    "/:id/graduate",
    authMiddleware,
    graduateStudent
);

// Archive student
router.patch(
    "/:id/archive",
    authMiddleware,
    archiveStudent
);

// Permanently delete student
router.delete(
    "/:id",
    authMiddleware,
    deleteStudent
);


module.exports = router;
