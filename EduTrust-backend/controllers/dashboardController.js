const Student = require("../models/student");

exports.getDashboardStats = async (req, res) => {
    try {

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

        res.json({
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

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};
