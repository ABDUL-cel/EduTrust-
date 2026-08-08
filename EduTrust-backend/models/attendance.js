const Attendance = require("../models/attendance");
const Student = require("../models/student");
const Class = require("../models/class");


// =======================================
// Check Teacher Access To Student
// =======================================
const verifyTeacherStudentAccess = async (
    req,
    student
) => {
    if (req.user.role !== "Teacher") {
        return true;
    }

    const teacherClass = await Class.findOne({
        school_id: req.user.school_id,
        class_teacher_id: req.user._id,
        name: student.class_name,
        arm: student.arm || "",
        status: "Active"
    });

    return !!teacherClass;
};


// =======================================
// Mark Attendance
// =======================================
exports.markAttendance = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const {
            student_id,
            date,
            status,
            note
        } = req.body;

        if (
            !student_id ||
            !date ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Student, date and attendance status are required."
            });
        }

        if (
            ![
                "Present",
                "Absent",
                "Late"
            ].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Attendance status must be Present, Absent or Late."
            });
        }

        const student = await Student.findOne({
            _id: student_id,
            school_id,
            status: {
                $ne: "Archived"
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found in your school."
            });
        }

        const teacherAllowed =
            await verifyTeacherStudentAccess(
                req,
                student
            );

        if (!teacherAllowed) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not assigned to this student's class."
            });
        }

        const attendanceDate =
            new Date(date);

        attendanceDate.setHours(
            0,
            0,
            0,
            0
        );

        const classItem =
            await Class.findOne({
                school_id,
                name: student.class_name,
                arm: student.arm || "",
                status: "Active"
            });

        const attendance =
            await Attendance.create({
                school_id,
                student_id,
                class_id:
                    classItem
                        ? classItem._id
                        : null,
                teacher_id: req.user._id,
                date: attendanceDate,
                status,
                note: note || ""
            });

        return res.status(201).json({
            success: true,
            message:
                "Attendance marked successfully.",
            attendance
        });

    } catch (error) {
        console.error(
            "MARK ATTENDANCE ERROR:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message:
                    "Attendance has already been recorded for this student on this date."
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Update Attendance
// =======================================
exports.updateAttendance = async (req, res) => {
    try {
        const attendance =
            await Attendance.findOne({
                _id: req.params.id,
                school_id: req.user.school_id
            }).populate(
                "student_id"
            );

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message:
                    "Attendance record not found."
            });
        }

        if (
            req.user.role === "Teacher"
        ) {
            const allowed =
                await verifyTeacherStudentAccess(
                    req,
                    attendance.student_id
                );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not assigned to this student's class."
                });
            }
        }

        const status =
            req.body.status ||
            attendance.status;

        if (
            ![
                "Present",
                "Absent",
                "Late"
            ].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance status."
            });
        }

        attendance.status = status;

        if (
            req.body.note !== undefined
        ) {
            attendance.note =
                req.body.note;
        }

        await attendance.save();

        return res.json({
            success: true,
            message:
                "Attendance updated successfully.",
            attendance
        });

    } catch (error) {
        console.error(
            "UPDATE ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Daily Attendance
// =======================================
exports.getDailyAttendance = async (
    req,
    res
) => {
    try {
        const date =
            req.query.date ||
            new Date().toISOString();

        const attendanceDate =
            new Date(date);

        attendanceDate.setHours(
            0,
            0,
            0,
            0
        );

        const nextDate =
            new Date(attendanceDate);

        nextDate.setDate(
            nextDate.getDate() + 1
        );

        const filter = {
            school_id: req.user.school_id,
            date: {
                $gte: attendanceDate,
                $lt: nextDate
            }
        };

        const records =
            await Attendance.find(filter)
                .populate(
                    "student_id",
                    "first_name last_name admission_number class_name arm"
                )
                .populate(
                    "class_id",
                    "name arm"
                )
                .populate(
                    "teacher_id",
                    "full_name"
                )
                .sort({
                    created_at: 1
                });

        return res.json({
            success: true,
            date: attendanceDate,
            count: records.length,
            attendance: records
        });

    } catch (error) {
        console.error(
            "GET DAILY ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Student Attendance History
// =======================================
exports.getStudentAttendance = async (
    req,
    res
) => {
    try {
        const student =
            await Student.findOne({
                _id: req.params.studentId,
                school_id: req.user.school_id
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }

        const teacherAllowed =
            await verifyTeacherStudentAccess(
                req,
                student
            );

        if (!teacherAllowed) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not assigned to this student's class."
            });
        }

        const records =
            await Attendance.find({
                school_id:
                    req.user.school_id,
                student_id:
                    student._id
            })
                .populate(
                    "teacher_id",
                    "full_name"
                )
                .sort({
                    date: -1
                });

        return res.json({
            success: true,
            count: records.length,
            attendance: records
        });

    } catch (error) {
        console.error(
            "GET STUDENT ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Attendance Summary
// =======================================
exports.getAttendanceSummary = async (
    req,
    res
) => {
    try {
        const match = {
            school_id:
                req.user.school_id
        };

        if (req.query.studentId) {
            match.student_id =
                req.query.studentId;
        }

        if (req.query.from) {
            const from =
                new Date(req.query.from);

            from.setHours(
                0,
                0,
                0,
                0
            );

            match.date = {
                $gte: from
            };
        }

        if (req.query.to) {
            const to =
                new Date(req.query.to);

            to.setHours(
                23,
                59,
                59,
                999
            );

            match.date = {
                ...(match.date || {}),
                $lte: to
            };
        }

        const summary =
            await Attendance.aggregate([
                {
                    $match: match
                },
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);

        const result = {
            Present: 0,
            Absent: 0,
            Late: 0
        };

        summary.forEach(item => {
            result[item._id] =
                item.count;
        });

        return res.json({
            success: true,
            summary: result,
            total:
                result.Present +
                result.Absent +
                result.Late
        });

    } catch (error) {
        console.error(
            "ATTENDANCE SUMMARY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
