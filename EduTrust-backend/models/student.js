const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({

    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    },

    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
        default: null
    },

    admission_number: {
        type: String,
        unique: true,
        required: true,
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
        default: ""
    },

    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true
    },

    date_of_birth: {
        type: Date,
        required: true
    },

    class_name: {
        type: String,
        required: true
    },

    arm: {
        type: String,
        default: ""
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
            "Suspended",
            "Graduated",
            "Archived"
        ],
        default: "Pending"
    }
status: {
    type: String,
    enum: [
        "Pending",
        "Active",
        "Suspended",
        "Graduated",
        "Archived"
    ],
    default: "Pending"
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
});


module.exports = mongoose.model("Student", StudentSchema);
