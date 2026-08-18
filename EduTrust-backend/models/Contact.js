const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        userRole: {
            type: String,
            required: [true, 'Role is required'],
            enum: ['School Owner', 'Teacher', 'Parent', 'Other'],
            default: 'Other'
        },
        subject: {
            type: String,
            trim: true,
            default: 'General Inquiry'
        },
        message: {
            type: String,
            required: [true, 'Message body is required'],
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved'],
            default: 'Pending'
        }
    },
    {
        timestamps: true // Automatically generates createdAt & updatedAt
    }
);

module.exports = mongoose.model('Contact', contactSchema);
