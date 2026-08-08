const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        full_name: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        relationship: {
            type: String,
            default: "Parent",
            trim: true
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            }
        ],

        status: {
            type: String,
            enum: ["Active", "Archived"],
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

module.exports = mongoose.model(
    "Parent",
    ParentSchema
);
