const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        // ==================================================
        // BASIC USER INFORMATION
        // ==================================================

        first_name: {
            type: String,
            default: "",
            trim: true
        },

        last_name: {
            type: String,
            default: "",
            trim: true
        },

        other_name: {
            type: String,
            default: "",
            trim: true
        },

        full_name: {
            type: String,
            default: "",
            trim: true
        },

        email: {
            type: String,
            default: "",
            lowercase: true,
            trim: true,
            index: true
        },

        phone: {
            type: String,
            default: "",
            trim: true,
            index: true
        },

        password: {
            type: String,
            required: true
        },

        // ==================================================
        // ROLE
        // ==================================================

        role: {
            type: String,
            enum: [
                "SuperAdmin",
                "Principal",
                "Teacher",
                "Parent",
                "Student",
                "Staff"
            ],
            required: true,
            index: true
        },

        // ==================================================
        // ACCOUNT STATUS
        // ==================================================

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive",
                "Suspended",
                "Pending"
            ],
            default: "Active",
            index: true
        },

        // ==================================================
        // SCHOOL
        // ==================================================

        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            default: null,
            index: true
        },

        // ==================================================
        // LINKED PROFILES
        // ==================================================

        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null,
            index: true
        },

        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Parent",
            default: null,
            index: true
        },

        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: null,
            index: true
        },

        staff_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null,
            index: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

// ======================================================
// INDEXES
// ======================================================

UserSchema.index({
    school_id: 1,
    role: 1
});

UserSchema.index({
    school_id: 1,
    email: 1
});

UserSchema.index({
    school_id: 1,
    phone: 1
});

module.exports = mongoose.model("User", UserSchema);
