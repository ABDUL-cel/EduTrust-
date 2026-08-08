const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createClass,
    getClasses,
    updateClass,
    archiveClass,
    getMyClasses,
    getMyClass
} = require("../controllers/classController");


router.use(authMiddleware);


// =======================================
// Teacher's Assigned Classes
// =======================================

router.get(
    "/my/classes",
    roleMiddleware("Teacher"),
    getMyClasses
);


router.get(
    "/my/classes/:id",
    roleMiddleware("Teacher"),
    getMyClass
);


// =======================================
// All School Classes
// =======================================

router.get(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getClasses
);


// =======================================
// Create Class
// =======================================

router.post(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    createClass
);


// =======================================
// Update Class
// =======================================

router.put(
    "/:id",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    updateClass
);


// =======================================
// Archive Class
// =======================================

router.patch(
    "/:id/archive",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    archiveClass
);


module.exports = router;
