const Notification = require("../models/notification");


// =======================================
// Get My Notifications
// =======================================
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications =
            await Notification.find({
                school_id: req.user.school_id,
                recipient_id: req.user._id
            })
                .populate(
                    "sender_id",
                    "full_name"
                )
                .sort({
                    created_at: -1
                });

        const unreadCount =
            await Notification.countDocuments({
                school_id: req.user.school_id,
                recipient_id: req.user._id,
                is_read: false
            });

        return res.json({
            success: true,
            unreadCount,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error(
            "GET NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Mark Notification As Read
// =======================================
exports.markAsRead = async (req, res) => {
    try {
        const notification =
            await Notification.findOne({
                _id: req.params.id,
                school_id: req.user.school_id,
                recipient_id: req.user._id
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found."
            });
        }

        notification.is_read = true;
        notification.read_at = new Date();

        await notification.save();

        return res.json({
            success: true,
            message:
                "Notification marked as read.",
            notification
        });

    } catch (error) {
        console.error(
            "MARK NOTIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Mark All Notifications As Read
// =======================================
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                school_id:
                    req.user.school_id,
                recipient_id:
                    req.user._id,
                is_read: false
            },
            {
                $set: {
                    is_read: true,
                    read_at: new Date()
                }
            }
        );

        return res.json({
            success: true,
            message:
                "All notifications marked as read."
        });

    } catch (error) {
        console.error(
            "MARK ALL NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Create Notification
// =======================================
exports.createNotification = async (
    req,
    res
) => {
    try {
        const {
            recipient_id,
            title,
            message,
            type,
            reference_id
        } = req.body;

        if (
            !recipient_id ||
            !title ||
            !message
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Recipient, title and message are required."
            });
        }

        const notification =
            await Notification.create({
                school_id:
                    req.user.school_id,

                recipient_id,

                sender_id:
                    req.user._id,

                title,
                message,

                type:
                    type || "System",

                reference_id:
                    reference_id || null
            });

        return res.status(201).json({
            success: true,
            message:
                "Notification created successfully.",
            notification
        });

    } catch (error) {
        console.error(
            "CREATE NOTIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
