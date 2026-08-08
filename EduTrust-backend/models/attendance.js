const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },

        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            default: null
        },

        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        date: {
            type: Date,
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: [
                "Present",
                "Absent",
                "Late"
            ],
            required: true
        },

        note: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

AttendanceSchema.index(
    {
        school_id: 1,
        student_id: 1,
        date: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "Attendance",
    AttendanceSchema
);
