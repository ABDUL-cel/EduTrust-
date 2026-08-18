const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
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
        required: [true, 'User role is required'],
        enum: ['School Owner', 'Admin', 'Teacher', 'Parent', 'Student', 'Other']
    },
    subject: {
        type: String,
        required: [true, 'Inquiry subject is required']
    },
    message: {
        type: String,
        required: [true, 'Message body is required'],
        minlength: [10, 'Message must be at least 10 characters']
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved'],
        default: 'New'
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
