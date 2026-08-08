const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        
school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
    index: true
},


        principal_name: {
            type: String,
            required: true,
            trim: true
        },

        principal_email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        school_name: {
            type: String,
            required: true
        },

        school_type: {
            type: String
        },

        academic_session: {
            type: String
        },

        current_term: {
            type: String
        },

        address: {
            type: String
        },

        school_motto: {
            type: String,
            default: ""
        },

        website: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            enum: [
                "Super Admin",
                "Principal",
                "Vice Principal",
                "Bursar",
                "Teacher",
                "Accountant",
                "Secretary",
                "Parent",
                "Student"
            ],
            default: "Principal"
        },

        profile_photo: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Active", "Inactive", "Suspended"],
            default: "Active"
        },

        last_login: {
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

module.exports = mongoose.model("User", UserSchema);
