const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerStudent,
    getPendingStudents,
    getActiveStudents,
    approveStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent
} = require("../controllers/studentController");

// =======================================
// STUDENT REGISTRATION
// =======================================

// Register new student
// POST /api/students
router.post("/", authMiddleware, registerStudent);


// =======================================
// STUDENT LISTS
// =======================================

// Get pending students
// GET /api/students/pending
router.get("/pending", authMiddleware, getPendingStudents);

// Get active students
// GET /api/students/active
router.get("/active", authMiddleware, getActiveStudents);


// =======================================
// STUDENT STATUS MANAGEMENT
// =======================================

// Approve student
// PATCH /api/students/:id/approve
router.patch("/:id/approve", authMiddleware, approveStudent);

// Suspend student
// PATCH /api/students/:id/suspend
router.patch("/:id/suspend", authMiddleware, suspendStudent);

// Reinstate suspended student
// PATCH /api/students/:id/reinstate
router.patch("/:id/reinstate", authMiddleware, reinstateStudent);

// Graduate student
// PATCH /api/students/:id/graduate
router.patch("/:id/graduate", authMiddleware, graduateStudent);

// Archive student
// PATCH /api/students/:id/archive
router.patch("/:id/archive", authMiddleware, archiveStudent);


// =======================================
// EXPORT ROUTER
// =======================================

module.exports = router;// =======================================
// Suspend Student
// =======================================
exports.suspendStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Suspended" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student suspended successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Reinstate Student
// =======================================
exports.reinstateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Active" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student reinstated successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Graduate Student
// =======================================
exports.graduateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Graduated" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student graduated successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Archive Student
// =======================================
exports.archiveStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Archived" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student archived successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
