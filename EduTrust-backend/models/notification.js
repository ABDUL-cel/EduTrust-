const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        recipient_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "Result",
                "Attendance",
                "Announcement",
                "Student",
                "Assessment",
                "System"
            ],
            default: "System"
        },

        reference_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        is_read: {
            type: Boolean,
            default: false
        },

        read_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

NotificationSchema.index({
    school_id: 1,
    recipient_id: 1,
    created_at: -1
});

module.exports = mongoose.model(
    "Notification",
    NotificationSchema
);
