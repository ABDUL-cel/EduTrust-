const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        description: {
            type: String,
            default: ""
        },

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

SubjectSchema.index(
    {
        school_id: 1,
        code: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Subject", SubjectSchema);
