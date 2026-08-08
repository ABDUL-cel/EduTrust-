```js
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerParent,
    getParents,
    getParent,
    updateParent,
    linkParentToStudent,
    unlinkParentFromStudent,
    suspendParent,
    activateParent
} = require("../controllers/parentController");


// Register parent
router.post(
    "/",
    authMiddleware,
    registerParent
);


// Get all parents
router.get(
    "/",
    authMiddleware,
    getParents
);


// Get single parent + children
router.get(
    "/:id",
    authMiddleware,
    getParent
);


// Update parent
router.put(
    "/:id",
    authMiddleware,
    updateParent
);


// Link parent to student
router.patch(
    "/:id/link-student",
    authMiddleware,
    linkParentToStudent
);


// Unlink parent from student
router.patch(
    "/:id/unlink-student/:studentId",
    authMiddleware,
    unlinkParentFromStudent
);


// Suspend parent
router.patch(
    "/:id/suspend",
    authMiddleware,
    suspendParent
);


// Activate parent
router.patch(
    "/:id/activate",
    authMiddleware,
    activateParent
);


module.exports = router;
```

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
    archiveStudent,
    linkParent,
    unlinkParent
} = require("../controllers/studentController");

// =======================================
// All student routes require authentication
// =======================================
router.use(authMiddleware);

// =======================================
// Student Lists
// =======================================

// Get all students
router.get("/", getStudents);

// Get pending students
router.get("/pending", getPendingStudents);

// Get active students
router.get("/active", getActiveStudents);

// Get suspended students
router.get("/suspended", getSuspendedStudents);

// =======================================
// Register Student
// =======================================
router.post("/", registerStudent);

// =======================================
// Single Student
// =======================================
router.get("/:id", getStudent);

// =======================================
// Student Approval
// =======================================
router.patch("/:id/approve", approveStudent);

// =======================================
// Student Suspension
// =======================================
router.patch("/:id/suspend", suspendStudent);

// =======================================
// Student Reinstatement
// =======================================
router.patch("/:id/reinstate", reinstateStudent);

// =======================================
// Graduate Student
// =======================================
router.patch("/:id/graduate", graduateStudent);

// =======================================
// Archive Student
// =======================================
router.patch("/:id/archive", archiveStudent);

// =======================================
// Parent Linking
// =======================================
router.patch("/:id/parent", linkParent);

// Remove parent from student
router.delete("/:id/parent", unlinkParent);

module.exports = router;
