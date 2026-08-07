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

// =======================================
// Authentication
// All student routes require login
// =======================================
router.use(authMiddleware);

// =======================================
// Register Student
// POST /api/students
// =======================================
router.post("/", registerStudent);

// =======================================
// Get All Students
// GET /api/students
// =======================================
router.get("/", getStudents);

// =======================================
// Get Pending Students
// GET /api/students/pending
// =======================================
router.get("/pending", getPendingStudents);

// =======================================
// Get Active Students
// GET /api/students/active
// =======================================
router.get("/active", getActiveStudents);

// =======================================
// Get Suspended Students
// GET /api/students/suspended
// =======================================
router.get("/suspended", getSuspendedStudents);

// =======================================
// Get Single Student
// GET /api/students/:id
// =======================================
router.get("/:id", getStudent);

// =======================================
// Approve Student
// PATCH /api/students/:id/approve
// =======================================
router.patch("/:id/approve", approveStudent);

// =======================================
// Suspend Student
// PATCH /api/students/:id/suspend
// =======================================
router.patch("/:id/suspend", suspendStudent);

// =======================================
// Reinstate Student
// PATCH /api/students/:id/reinstate
// =======================================
router.patch("/:id/reinstate", reinstateStudent);

// =======================================
// Graduate Student
// PATCH /api/students/:id/graduate
// =======================================
router.patch("/:id/graduate", graduateStudent);

// =======================================
// Archive Student
// PATCH /api/students/:id/archive
// =======================================
router.patch("/:id/archive", archiveStudent);

module.exports = router;
        res.json({ success: true, message: "Student archived successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
