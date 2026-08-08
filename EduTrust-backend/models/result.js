
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        // =======================================
        // Student Information
        // =======================================
        studentId: {
            type: String,
            required: true,
            trim: true
        },

        studentName: {
            type: String,
            required: true,
            trim: true
        },

        // =======================================
        // School
        // =======================================
        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // =======================================
        // Academic Information
        // =======================================
        academicSession: {
            type: String,
            required: true,
            trim: true
        },

        term: {
            type: String,
            required: true,
            trim: true
        },

        classLevel: {
            type: String,
            required: true,
            trim: true
        },

        // =======================================
        // Assessment Structure
        // =======================================
        assessment_structure_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssessmentStructure",
            default: null
        },

        // =======================================
        // Assessment Breakdown
        // =======================================
        assessment_breakdown: [
            {
                component_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: null
                },

                component_name: {
                    type: String,
                    trim: true
                },

                raw_score: {
                    type: Number,
                    default: 0,
                    min: 0
                },

                max_score: {
                    type: Number,
                    default: 0,
                    min: 0
                },

                percentage: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 100
                },

                weighted_score: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        ],

        // =======================================
        // Subjects
        // =======================================
        subjects: [
            {
                subjectName: {
                    type: String,
                    required: true,
                    trim: true
                },

                caScore: {
                    type: Number,
                    default: 0,
                    min: 0
                },

                examScore: {
                    type: Number,
                    default: 0,
                    min: 0
                },

                totalScore: {
                    type: Number,
                    required: true,
                    min: 0
                },

                grade: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],

        // =======================================
        // Overall Result
        // =======================================
        totalMarksObtained: {
            type: Number,
            required: true,
            min: 0
        },

        averageScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        remarks: {
            type: String,
            default: "Passed",
            trim: true
        },

        // =======================================
        // Result Access
        // =======================================
        accessFee: {
            type: Number,
            default: 1100,
            min: 0
        },

        hasPaid: {
            type: Boolean,
            default: false
        },

        // =======================================
        // Result Status
        // =======================================
        status: {
            type: String,
            enum: [
                "Draft",
                "Submitted",
                "Published"
            ],
            default: "Draft"
        },

        submittedAt: {
            type: Date,
            default: null
        },

        publishedAt: {
            type: Date,
            default: null
        },

        publishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);


// =======================================
// Helpful Indexes
// =======================================
resultSchema.index({
    schoolId: 1,
    studentId: 1,
    academicSession: 1,
    term: 1
});

resultSchema.index({
    schoolId: 1,
    classLevel: 1,
    academicSession: 1,
    term: 1
});


// =======================================
// Export
// =======================================
module.exports =
    mongoose.models.Result ||
    mongoose.model("Result", resultSchema);
