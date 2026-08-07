const Student = require("../models/student");

// ======================================
// Dashboard Overview
// ======================================
exports.getDashboardOverview = async (req, res) => {
    try {

        // School owner is the logged-in user
        const school_id = req.user.id;

        const totalStudents = await Student.countDocuments({
            school_id
        });

        const pendingStudents = await Student.countDocuments({
            school_id,
            status: "Pending"
        });

        const activeStudents = await Student.countDocuments({
            school_id,
            status: "Active"
        });

        const suspendedStudents = await Student.countDocuments({
            school_id,
            status: "Suspended"
        });

        const graduatedStudents = await Student.countDocuments({
            school_id,
            status: "Graduated"
        });

        const archivedStudents = await Student.countDocuments({
            school_id,
            status: "Archived"
        });

        res.status(200).json({
            success: true,
            dashboard: {
                totalStudents,
                pendingStudents,
                activeStudents,
                suspendedStudents,
                graduatedStudents,
                archivedStudents
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};
