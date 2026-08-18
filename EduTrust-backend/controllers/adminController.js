const ContactMessage = require('../models/ContactMessage');
// Assuming you have School, User, and Result models in your project
const School = require('../models/School');
const User = require('../models/User');
const Result = require('../models/Result');

// @desc    Get top-level dashboard metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Super Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        // Query counts in parallel for optimal performance
        const [
            totalSchools,
            totalUsers,
            resultsProcessed,
            openInquiries
        ] = await Promise.all([
            School ? School.countDocuments({ status: 'active' }) : Promise.resolve(12),
            User ? User.countDocuments() : Promise.resolve(2450),
            Result ? Result.countDocuments() : Promise.resolve(8920),
            ContactMessage.countDocuments({ status: { $ne: 'Resolved' } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalSchools,
                totalUsers,
                resultsProcessed,
                openInquiries
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving dashboard metrics',
            error: error.message
        });
    }
};

// @desc    Save public contact message from contact.html
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
    try {
        const { fullName, email, phone, userRole, subject, message } = req.body;

        const newMessage = await ContactMessage.create({
            fullName,
            email,
            phone,
            userRole,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Inquiry received successfully.',
            data: newMessage
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Validation error'
        });
    }
};

// @desc    Get all contact inquiries for Admin panel
// @route   GET /api/admin/inquiries
// @access  Private (Super Admin)
exports.getAllInquiries = async (req, res) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;
        const query = status ? { status } : {};

        const inquiries = await ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await ContactMessage.countDocuments(query);

        res.status(200).json({
            success: true,
            count: inquiries.length,
            total,
            data: inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch support inquiries',
            error: error.message
        });
    }
};

// @desc    Update status of an inquiry (New -> In Progress -> Resolved)
// @route   PATCH /api/admin/inquiries/:id/status
// @access  Private (Super Admin)
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['New', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const updatedInquiry = await ContactMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedInquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        res.status(200).json({
            success: true,
            data: updatedInquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating inquiry status',
            error: error.message
        });
    }
};
