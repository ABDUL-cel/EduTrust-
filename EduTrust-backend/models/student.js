const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true
        },

        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Parent",
            default: null,
            index: true
        },

        // =================================================
        // INITIAL REGISTRATION / TRACKING NUMBER
        // Example: EDU749279
        // =================================================
        admission_number: {
            type: String,
            required: true,
            trim: true
        },

        // =================================================
        // OFFICIAL SCHOOL MATRIC NUMBER
        // Example: INT/JSS1/A/2026/0001
        //
        // This is generated ONLY after approval.
        // =================================================
        matric_number: {
            type: String,
            default: "",
            trim: true
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

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        password: {
            type: String,
            default: ""
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Not Specified"
            ],
            default: "Not Specified"
        },

        date_of_birth: {
            type: Date,
            default: null
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

        department: {
            type: String,
            default: "",
            trim: true
        },

        admission_date: {
            type: Date,
            default: Date.now
        },

        passport: {
            type: String,
            default: ""
        },

        home_address: {
            type: String,
            default: ""
        },

        medical_information: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Active",
                "Rejected",
                "Suspended",
                "Graduated",
                "Archived"
            ],
            default: "Pending",
            index: true
        },

        approved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approved_at: {
            type: Date,
            default: null
        },

        suspended_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        suspended_at: {
            type: Date,
            default: null
        },

        suspension_reason: {
            type: String,
            default: ""
        },

        archived_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        archived_at: {
            type: Date,
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

// ======================================================
// INDEXES
// ======================================================

// EDU number unique within school
StudentSchema.index(
    {
        school_id: 1,
        admission_number: 1
    },
    {
        unique: true
    }
);

// Official matric number unique within school
StudentSchema.index(
    {
        school_id: 1,
        matric_number: 1
    },
    {
        unique: true,
        sparse: true
    }
);

// Fast school/status searches
StudentSchema.index({
    school_id: 1,
    status: 1
});

// Parent searches
StudentSchema.index({
    school_id: 1,
    parent_id: 1
});

// Matric lookup
StudentSchema.index({
    school_id: 1,
    matric_number: 1
});

module.exports = mongoose.model("Student", StudentSchema);
