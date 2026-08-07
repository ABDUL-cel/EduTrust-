
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
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        address: {
            type: String,
            trim: true,
            default: ""
        },

        school_type: {
            type: String,
            trim: true,
            default: ""
        },

        academic_session: {
            type: String,
            trim: true,
            default: ""
        },

        current_term: {
            type: String,
            trim: true,
            default: ""
        },

        motto: {
            type: String,
            trim: true,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        logo: {
            type: String,
            default: ""
        },

        principal_name: {
            type: String,
            trim: true,
            default: ""
        },

        principal_email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
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
