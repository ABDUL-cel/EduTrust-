const Student = require("../models/student");

// =======================================
// Dashboard Overview
// =======================================
exports.getDashboardOverview = async (req, res) => {
    try {
        // Each logged-in school owner is treated as the school owner.
        // For the current User model, req.user.id is the logged-in user's ID.
        const school_id = req.user.id;

        const [
            totalStudents,
            pendingStudents,
            activeStudents,
            suspendedStudents,
            graduatedStudents,
            archivedStudents
        ] = await Promise.all([
            Student.countDocuments({ school_id }),
            Student.countDocuments({
                school_id,
                status: "Pending"
            }),
            Student.countDocuments({
                school_id,
                status: "Active"
            }),
            Student.countDocuments({
                school_id,
                status: "Suspended"
            }),
            Student.countDocuments({
                school_id,
                status: "Graduated"
            }),
            Student.countDocuments({
                school_id,
                status: "Archived"
            })
        ]);

        return res.status(200).json({
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

    } catch (error) {
        console.error("DASHBOARD OVERVIEW ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error retrieving dashboard information.",
            error: error.message
        });
    }
};
