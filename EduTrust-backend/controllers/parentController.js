const Parent = require("../models/parent");
const Student = require("../models/student");
const Attendance = require("../models/attendance");
const Result = require("../models/result");


// =======================================
// Get Parent Profile
// =======================================
exports.getMyProfile = async (req, res) => {
    try {
        const parent = await Parent.findOne({
            user_id: req.user._id,
            school_id: req.user.school_id,
            status: "Active"
        }).populate(
            "students",
            "first_name last_name admission_number class_name arm status"
        );

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found."
            });
        }

        return res.json({
            success: true,
            parent
        });

    } catch (error) {
        console.error(
            "GET PARENT PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get My Children
// =======================================
exports.getMyChildren = async (req, res) => {
    try {
        const parent = await Parent.findOne({
            user_id: req.user._id,
            school_id: req.user.school_id,
            status: "Active"
        }).populate(
            "students",
            "first_name last_name admission_number class_name arm status"
        );

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found."
            });
        }

        return res.json({
            success: true,
            count: parent.students.length,
            students: parent.students
        });

    } catch (error) {
        console.error(
            "GET MY CHILDREN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Verify Child Belongs To Parent
// =======================================
const verifyChild = async (
    req,
    studentId
) => {
    const parent = await Parent.findOne({
        user_id: req.user._id,
        school_id: req.user.school_id,
        status: "Active"
    });

    if (!parent) {
        return null;
    }

    const linked =
        parent.students.some(
            id =>
                id.toString() ===
                studentId.toString()
        );

    if (!linked) {
        return null;
    }

    return Student.findOne({
        _id: studentId,
        school_id: req.user.school_id
    });
};


// =======================================
// Child Attendance
// =======================================
exports.getChildAttendance = async (
    req,
    res
) => {
    try {
        const student =
            await verifyChild(
                req,
                req.params.studentId
            );

        if (!student) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this student's records."
            });
        }

        const attendance =
            await Attendance.find({
                school_id:
                    req.user.school_id,
                student_id:
                    student._id
            }).sort({
                date: -1
            });

        return res.json({
            success: true,
            student: {
                id: student._id,
                name:
                    `${student.first_name} ${student.last_name}`,
                admission_number:
                    student.admission_number
            },
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.error(
            "GET CHILD ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Child Results
// =======================================
exports.getChildResults = async (
    req,
    res
) => {
    try {
        const student =
            await verifyChild(
                req,
                req.params.studentId
            );

        if (!student) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this student's records."
            });
        }

        const results =
            await Result.find({
                school_id:
                    req.user.school_id,
                student_id:
                    student._id,
                status: "Published"
            }).sort({
                created_at: -1
            });

        return res.json({
            success: true,
            student: {
                id: student._id,
                name:
                    `${student.first_name} ${student.last_name}`,
                admission_number:
                    student.admission_number
            },
            count: results.length,
            results
        });

    } catch (error) {
        console.error(
            "GET CHILD RESULTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
