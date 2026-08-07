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

// ==========================
// Student Registration
// ==========================
router.post("/register", authMiddleware, registerStudent);

// ==========================
// Student Lists
// ==========================
router.get("/pending", authMiddleware, getPendingStudents);

router.get("/active", authMiddleware, getActiveStudents);

// ==========================
// Student Actions
// ==========================
router.put("/approve/:id", authMiddleware, approveStudent);

router.put("/suspend/:id", authMiddleware, suspendStudent);

router.put("/reinstate/:id", authMiddleware, reinstateStudent);

router.put("/graduate/:id", authMiddleware, graduateStudent);

router.put("/archive/:id", authMiddleware, archiveStudent);

module.exports = router;
