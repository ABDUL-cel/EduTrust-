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
    linkParentToStudent,
    unlinkParentFromStudent,
    getStudentParent,
    getStudentProfile,
    getStudentDashboardData
} = require("../controllers/studentController");

const authMiddleware =
    require("../middleware/authMiddleware");


// =====================================================
// REGISTER STUDENT
// =====================================================

router.post(
    "/",
    authMiddleware,
    registerStudent
);


// =====================================================
// LOGGED-IN STUDENT PROFILE
// =====================================================

router.get(
    "/me/profile",
    authMiddleware,
    getStudentProfile
);


// =====================================================
// LOGGED-IN STUDENT DASHBOARD
// =====================================================

router.get(
    "/me/dashboard",
    authMiddleware,
    getStudentDashboardData
);


// =====================================================
// GET ALL STUDENTS
// =====================================================

router.get(
    "/",
    authMiddleware,
    getStudents
);


// =====================================================
// GET PENDING STUDENTS
// =====================================================

router.get(
    "/pending",
    authMiddleware,
    getPendingStudents
);


// =====================================================
// GET ACTIVE STUDENTS
// =====================================================

router.get(
    "/active",
    authMiddleware,
    getActiveStudents
);


// =====================================================
// GET STUDENT'S PARENT
// IMPORTANT: BEFORE /:id
// =====================================================

router.get(
    "/:id/parent",
    authMiddleware,
    getStudentParent
);


// =====================================================
// LINK PARENT TO STUDENT
// =====================================================

router.patch(
    "/:id/parent",
    authMiddleware,
    linkParentToStudent
);


// =====================================================
// UNLINK PARENT FROM STUDENT
// =====================================================

router.delete(
    "/:id/parent",
    authMiddleware,
    unlinkParentFromStudent
);


// =====================================================
// APPROVE STUDENT
// =====================================================

router.patch(
    "/:id/approve",
    authMiddleware,
    approveStudent
);


// =====================================================
// UPDATE STUDENT
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    updateStudent
);


// =====================================================
// SUSPEND STUDENT
// =====================================================

router.patch(
    "/:id/suspend",
    authMiddleware,
    suspendStudent
);


// =====================================================
// REINSTATE STUDENT
// =====================================================

router.patch(
    "/:id/reinstate",
    authMiddleware,
    reinstateStudent
);


// =====================================================
// GRADUATE STUDENT
// =====================================================

router.patch(
    "/:id/graduate",
    authMiddleware,
    graduateStudent
);


// =====================================================
// ARCHIVE STUDENT
// =====================================================

router.patch(
    "/:id/archive",
    authMiddleware,
    archiveStudent
);


// =====================================================
// DELETE STUDENT
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    deleteStudent
);


// =====================================================
// GET ONE STUDENT
// IMPORTANT: KEEP THIS LAST
// =====================================================

router.get(
    "/:id",
    authMiddleware,
    getStudent
);


module.exports = router;
