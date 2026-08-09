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
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        address: {
            type: String,
            default: "",
            trim: true
        },

        school_type: {
            type: String,
            default: "",
            trim: true
        },

        academic_session: {
            type: String,
            default: "",
            trim: true
        },

        current_term: {
            type: String,
            default: "",
            trim: true
        },

        motto: {
            type: String,
            default: "",
            trim: true
        },

        website: {
            type: String,
            default: "",
            trim: true
        },

        logo: {
            type: String,
            default: "",
            trim: true
        },

        principal_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive",
                "Suspended"
            ],
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

SchoolSchema.index({
    email: 1
});

module.exports = mongoose.model("School", SchoolSchema);
