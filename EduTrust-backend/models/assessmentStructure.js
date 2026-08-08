const mongoose = require("mongoose");

const AssessmentStructureSchema =
    new mongoose.Schema(
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

            academic_session: {
                type: String,
                required: true,
                trim: true
            },

            term: {
                type: String,
                required: true,
                trim: true
            },

            components: [
                {
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

                    max_score: {
                        type: Number,
                        required: true,
                        min: 1
                    },

                    percentage: {
                        type: Number,
                        required: true,
                        min: 0,
                        max: 100
                    }
                }
            ],

            total_percentage: {
                type: Number,
                default: 0
            },

            status: {
                type: String,
                enum: [
                    "Active",
                    "Inactive"
                ],
                default: "Active"
            },

            created_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        },
        {
            timestamps: {
                createdAt: "created_at",
                updatedAt: "updated_at"
            }
        }
    );


AssessmentStructureSchema.index({
    school_id: 1,
    academic_session: 1,
    term: 1
});


module.exports =
    mongoose.model(
        "AssessmentStructure",
        AssessmentStructureSchema
    );
