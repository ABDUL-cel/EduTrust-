const express = require("express");
const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");

// Public / Auth routes
router.post("/register", authMiddleware, registerParent);
router.post("/login", loginParent);
router.get("/profile", authMiddleware, getParentProfile);

// Dashboard management routes (For Principal / Admin)
router.get("/", authMiddleware, getParents);
router.get("/:id", authMiddleware, getParentById);

module.exports = router;
