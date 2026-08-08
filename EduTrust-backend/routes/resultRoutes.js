
const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },

        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
            index: true
        },

        academic_session: {
            type: String,
            required: true,
            trim: true
        },

        term: {
            type: String,
            enum: [
                "First Term",
                "Second Term",
                "Third Term"
            ],
            required: true
        },

        class_name: {
            type: String,
            required: true,
            trim: true
        },

        arm: {
            type: String,
            default: "",
            trim: true
        },

        ca_score: {
            type: Number,
            default: 0,
            min: 0,
            max: 40
        },

        exam_score: {
            type: Number,
            default: 0,
            min: 0,
            max: 60
        },

        total_score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        grade: {
            type: String,
            default: ""
        },

        remark: {
            type: String,
            default: ""
        },

        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: [
                "Draft",
                "Submitted",
                "Published"
            ],
            default: "Draft"
        },

        submitted_at: {
            type: Date,
            default: null
        },

        published_at: {
            type: Date,
            default: null
        },

        published_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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


// Prevent duplicate result for the same student,
// subject, session and term.
ResultSchema.index(
    {
        school_id: 1,
        student_id: 1,
        subject_id: 1,
        academic_session: 1,
        term: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model(
    "Result",
    ResultSchema
);
