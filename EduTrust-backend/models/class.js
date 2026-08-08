const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
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

        arm: {
            type: String,
            default: "",
            trim: true
        },

        class_teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        subjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subject"
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

ClassSchema.index({
    school_id: 1,
    name: 1,
    arm: 1
});

module.exports = mongoose.model("Class", ClassSchema);
