const express = require("express");

const router = express.Router();

const {
    createParent,
    getParents,
    getParentById,
    updateParent,
    deleteParent,
    linkStudentToParent
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", createParent);

router.get("/", getParents);

router.get("/:id", getParentById);

router.put("/:id", updateParent);

router.delete("/:id", deleteParent);

router.put(
    "/:parentId/students/:studentId",
    linkStudentToParent
);

module.exports = router;
