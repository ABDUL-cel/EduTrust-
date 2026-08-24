// routes/studentRoutes.js
const express = require("express");
const router = express.Router();

const {
    authMiddleware,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getStudents,
    getStudent,
    registerStudent,
    updateStudent,
    approveStudent,
    rejectStudent,
    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent,
    deleteStudent,
    getStudentParent,
    updateStudentParent,
    deleteStudentParent
} = require("../controllers/studentController");

router.use(authMiddleware);

const schoolStaff = authorizeRoles(
    "Principal",
    "Vice Principal",
    "Teacher",
    "School Admin",
    "Admin",
    "SuperAdmin"
);

router.get("/", schoolStaff, getStudents);

router.get("/:id", schoolStaff, getStudent);

router.post("/register", schoolStaff, registerStudent);

router.put("/:id", schoolStaff, updateStudent);

router.patch("/:id/approve", schoolStaff, approveStudent);

router.patch("/:id/reject", schoolStaff, rejectStudent);

router.patch("/:id/suspend", schoolStaff, suspendStudent);

router.patch("/:id/reinstate", schoolStaff, reinstateStudent);

router.patch("/:id/graduate", schoolStaff, graduateStudent);

router.patch("/:id/archive", schoolStaff, archiveStudent);

router.delete("/:id", schoolStaff, deleteStudent);

router.get("/:id/parent", schoolStaff, getStudentParent);

router.patch("/:id/parent", schoolStaff, updateStudentParent);

router.delete("/:id/parent", schoolStaff, deleteStudentParent);

module.exports = router;
