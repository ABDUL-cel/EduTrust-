const express = require("express");

const router = express.Router();
 const { authMiddleware } = require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
} = require("../controllers/notificationController");


router.use(authMiddleware);


// =======================================
// My Notifications
// =======================================
router.get(
    "/",
    getMyNotifications
);


// =======================================
// Mark One As Read
// =======================================
router.patch(
    "/:id/read",
    markAsRead
);


// =======================================
// Mark All As Read
// =======================================
router.patch(
    "/read-all",
    markAllAsRead
);


// =======================================
// Create Notification
// =======================================
router.post(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    createNotification
);


module.exports = router;
