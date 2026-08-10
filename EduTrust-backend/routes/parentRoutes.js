const express = require("express");
const router = express.Router();

const {
    registerParent,
    loginParent,
    getParentProfile
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerParent);

router.post("/login", loginParent);

router.get("/profile", authMiddleware, getParentProfile);

module.exports = router;
