const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema({

    school_name: {
        type: String,
        required: true,
        trim: true
    },

    school_email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    school_type: {
        type: String,
        enum: [
            "Primary",
            "Secondary",
            "Tertiary",
            "Combined"
        ],
        required: true
    },

    academic_session: {
        type: String,
        required: true
    },

    current_term: {
        type: String,
        enum: [
            "First Term",
            "Second Term",
            "Third Term"
        ],
        required: true
    },

    school_motto: {
        type: String,
        default: ""
    },

    website: {
        type: String,
        default: ""
    },

    logo: {
        type: String,
        default: ""
    },

    principal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    status: {
        type: String,
        enum: [
            "Active",
            "Inactive"
        ],
        default: "Active"
    }

},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model("School", SchoolSchema);
