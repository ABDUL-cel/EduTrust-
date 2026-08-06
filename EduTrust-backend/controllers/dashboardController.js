const Student = require("../models/student");
const User = require("../models/user");
const Parent = require("../models/parent");
const Payment = require("../models/payment");

exports.getDashboardOverview = async (req, res) => {

    try {

        const schoolId = req.user.school_id;

        const totalStudents = await Student.countDocuments({
            school_id: schoolId,
            status: "Active"
        });

        const pendingStudents = await Student.countDocuments({
            school_id: schoolId,
            status: "Pending"
        });

        const suspendedStudents = await Student.countDocuments({
            school_id: schoolId,
            status: "Suspended"
        });

        const totalParents = await Parent.countDocuments({
            school_id: schoolId
        });

        const totalStaff = await User.countDocuments({
            school_id: schoolId,
            role: {
                $ne: "Principal"
            }
        });

        res.json({

            success: true,

            overview: {

                totalStudents,

                pendingStudents,

                suspendedStudents,

                totalParents,

                totalStaff,

                feesCollected: 0,

                outstandingFees: 0

            }

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
