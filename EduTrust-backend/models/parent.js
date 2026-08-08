
const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        full_name: {
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

        address: {
            type: String,
            default: "",
            trim: true
        },

        occupation: {
            type: String,
            default: "",
            trim: true
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

// A phone number can exist in different schools,
// but should not be duplicated within the same school.
ParentSchema.index(
    { school_id: 1, phone: 1 },
    { unique: true }
);

module.exports = mongoose.model("Parent", ParentSchema);
