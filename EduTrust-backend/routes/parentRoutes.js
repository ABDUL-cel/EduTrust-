const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const {
    getMyProfile,
    getMyChildren,
    getChildAttendance,
    getChildResults
} = require("../controllers/parentController");


router.use(authMiddleware);

router.use(
    roleMiddleware("Parent")
);


router.get(
    "/me",
    getMyProfile
);


router.get(
    "/children",
    getMyChildren
);


router.get(
    "/children/:studentId/attendance",
    getChildAttendance
);


router.get(
    "/children/:studentId/results",
    getChildResults
);


module.exports = router;
