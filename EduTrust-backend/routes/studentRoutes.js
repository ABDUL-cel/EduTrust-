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
// All student routes require authentication
// =======================================

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

// Get single student
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

module.exports = router;        res.json({ success: true, message: "Student reinstated successfully.", student });
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
