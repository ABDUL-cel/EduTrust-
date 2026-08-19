const express = require("express");

const router = express.Router();

 const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createSubject,
    getSubjects,
    updateSubject,
    archiveSubject
} = require("../controllers/subjectController");

router.use(authMiddleware);

router.get(
    "/",
    getSubjects
);

router.post(
    "/",
    roleMiddleware("Principal", "Vice Principal"),
    createSubject
);

router.put(
    "/:id",
    roleMiddleware("Principal", "Vice Principal"),
    updateSubject
);

router.patch(
    "/:id/archive",
    roleMiddleware("Principal", "Vice Principal"),
    archiveSubject
);

module.exports = router;
