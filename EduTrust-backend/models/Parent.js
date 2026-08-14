const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        first_name: {
            type: String,
            required: true,
            trim: true
        },

        last_name: {
            type: String,
            required: true,
            trim: true
        },

        other_name: {
            type: String,
            default: "",
            trim: true
        },

        relationship: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            default: "",
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        alternate_phone: {
            type: String,
            default: "",
            trim: true
        },

        home_address: {
            type: String,
            default: "",
            trim: true
        },

        occupation: {
            type: String,
            default: "",
            trim: true
        },

        passport: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive"
            ],
            default: "Active",
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

ParentSchema.index({
    school_id: 1,
    phone: 1
});

ParentSchema.index({
    school_id: 1,
    email: 1
});

module.exports = mongoose.model("Parent", ParentSchema);
