const Contact = require('../models/Contact');

/**
 * @desc    Submit a new contact / support message
 * @route   POST /api/contact
 * @access  Public
 */
exports.submitContactForm = async (req, res) => {
    try {
        const { fullName, email, phone, userRole, subject, message } = req.body;

        // Validation check
        if (!fullName || !email || !userRole || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide full name, email, role, and message.'
            });
        }

        const newInquiry = await Contact.create({
            fullName,
            email,
            phone,
            userRole,
            subject: subject || 'General Inquiry',
            message
        });

        res.status(201).json({
            success: true,
            message: 'Your inquiry has been submitted successfully.',
            data: newInquiry
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing your request.'
        });
    }
};

/**
 * @desc    Get all contact submissions for Admin Dashboard
 * @route   GET /api/contact
 * @access  Private (Admin)
 */
exports.getInquiries = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const inquiries = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(limit);

        const openCount = await Contact.countDocuments({ status: 'Pending' });

        res.status(200).json({
            success: true,
            openInquiriesCount: openCount,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving inquiries.'
        });
    }
};
