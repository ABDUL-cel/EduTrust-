const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        school_type: {
            type: String,
            default: ""
        },

        academic_session: {
            type: String,
            default: ""
        },

        current_term: {
            type: String,
            default: ""
        },

        school_motto: {
            type: String,
            default: ""
        },

        website: {
            type: String,
            default: ""
        },

        logo: {
            type: String,
            default: ""
        },

        principal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: ["Active", "Inactive", "Suspended"],
            default: "Active"
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

module.exports = mongoose.model("School", SchoolSchema);
