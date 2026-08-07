const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerStudent,
    getStudents,
    getPendingStudents,
    getActiveStudents,
    getSuspendedStudents,
    getStudent,
    approveStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent
} = require("../controllers/studentController");

// All student routes require authentication
router.use(authMiddleware);

// Register student
router.post("/", registerStudent);

// Get all students
router.get("/", getStudents);

// Get pending students
router.get("/pending", getPendingStudents);

// Get active students
router.get("/active", getActiveStudents);

// Get suspended students
router.get("/suspended", getSuspendedStudents);

// Get one student
router.get("/:id", getStudent);

// Approve student
router.patch("/:id/approve", approveStudent);

// Suspend student
router.patch("/:id/suspend", suspendStudent);

// Reinstate student
router.patch("/:id/reinstate", reinstateStudent);

// Graduate student
router.patch("/:id/graduate", graduateStudent);

// Archive student
router.patch("/:id/archive", archiveStudent);

module.exports = router;
