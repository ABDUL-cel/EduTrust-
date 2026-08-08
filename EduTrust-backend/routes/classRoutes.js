const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createClass,
    getClasses,
    updateClass,
    archiveClass
} = require("../controllers/classController");

router.use(authMiddleware);

router.get(
    "/",
    getClasses
);

router.post(
    "/",
    roleMiddleware("Principal", "Vice Principal"),
    createClass
);

router.put(
    "/:id",
    roleMiddleware("Principal", "Vice Principal"),
    updateClass
);

router.patch(
    "/:id/archive",
    roleMiddleware("Principal", "Vice Principal"),
    archiveClass
);

module.exports = router;
