const Student = require("../models/student");

// =======================================
// Dashboard Overview
// =======================================
exports.getDashboardOverview = async (req, res) => {
    try {
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
            message: "Server error while loading dashboard.",
            error: error.message
        });
    }
};

// =======================================
// Alias
// Keeps compatibility with older code
// =======================================
exports.getDashboardStats = exports.getDashboardOverview;
