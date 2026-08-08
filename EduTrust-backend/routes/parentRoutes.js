
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


// =======================================
// Authentication for ALL parent routes
// =======================================
router.use(authMiddleware);


// =======================================
// Register Parent
// POST /api/parents
// =======================================
router.post("/", registerParent);


// =======================================
// Get Parents
// GET /api/parents
// =======================================
router.get("/", getParents);


// =======================================
// Get Single Parent + Children
// GET /api/parents/:id
// =======================================
router.get("/:id", getParent);


// =======================================
// Update Parent
// PUT /api/parents/:id
// =======================================
router.put("/:id", updateParent);


// =======================================
// Link Parent To Student
// PATCH /api/parents/:id/link-student
// =======================================
router.patch(
    "/:id/link-student",
    linkParentToStudent
);


// =======================================
// Unlink Parent From Student
// PATCH /api/parents/:id/unlink-student/:studentId
// =======================================
router.patch(
    "/:id/unlink-student/:studentId",
    unlinkParentFromStudent
);


// =======================================
// Suspend Parent
// PATCH /api/parents/:id/suspend
// =======================================
router.patch(
    "/:id/suspend",
    suspendParent
);


// =======================================
// Activate Parent
// PATCH /api/parents/:id/activate
// =======================================
router.patch(
    "/:id/activate",
    activateParent
);


module.exports = router;
