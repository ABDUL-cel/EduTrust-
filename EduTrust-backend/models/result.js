const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    studentName: {
        type: String,
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    academicSession: {
        type: String, // e.g., "2025/2026"
        required: true
    },
    term: {
        type: String, // e.g., "First Term", "Second Term", "Third Term"
        required: true
    },
    classLevel: {
        type: String, // e.g., "JSS 1", "SS 2"
        required: true
    },
    subjects: [{
        subjectName: { type: String, required: true },
        caScore: { type: Number, default: 0 },   // Continuous Assessment
        examScore: { type: Number, default: 0 }, // Exam Score
        totalScore: { type: Number, required: true },
        grade: { type: String, required: true }  // e.g., "A", "B", "C"
    }],
    totalMarksObtained: {
        type: Number,
        required: true
    },
    averageScore: {
        type: Number,
        required: true
    },
    remarks: {
        type: String,
        default: 'Passed'
    },
    accessFee: {
        type: Number,
        default: 1100 // Amount to check result in NGN
    },
    hasPaid: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
assessment_structure_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssessmentStructure",
    default: null
},

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
            default: 0
        },

        max_score: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },

        weighted_score: {
            type: Number,
            default: 0
        }
    }
],
module.exports = mongoose.models.Result || mongoose.model('Result', resultSchema)
