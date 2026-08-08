
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

