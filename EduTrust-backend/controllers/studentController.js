const Student = require("../models/student");
const Parent = require("../models/Parent");
const User = require("../models/User");

// =====================================================
// HELPER: GET SCHOOL ID
// =====================================================
const getSchoolId = (req) => {
    return req.user?.school_id || req.user?.schoolId || null;
};

// =====================================================
// REGISTER STUDENT
// =====================================================
const School = require("../models/School"); // Ensure School model is imported

exports.registerStudent = async (req, res) => {
    try {
        let school_id = getSchoolId(req); // Try getting from auth middleware (if logged in)

        const {
            school_code, // <-- Read school_code from public form payload
            parent_id,
            admission_number,
            first_name,
            last_name,
            other_name,
            gender,
            date_of_birth,
            class_name,
            arm,
            home_address,
            medical_information,
            passport
        } = req.body;

        // IF public registration (no auth token), look up school by school_code
        if (!school_id) {
            if (!school_code || !school_code.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "School code is required."
                });
            }

            // Find school by code (case-insensitive)
            const school = await School.findOne({
                school_code: { $regex: new RegExp(`^${school_code.trim()}$`, "i") }
            });

            if (!school) {
                return res.status(404).json({
                    success: false,
                    message: "School account could not be identified with the provided code."
                });
            }

            school_id = school._id;
        }

        // Validate required fields
        if (
            !admission_number?.trim() ||
            !first_name?.trim() ||
            !last_name?.trim() ||
            !gender ||
            !date_of_birth ||
            !class_name?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Admission number, first name, last name, gender, date of birth and class are required."
            });
        }

        // Validate parent if provided
        if (parent_id) {
            const parent = await Parent.findOne({
                _id: parent_id,
                school_id
            });

            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Selected parent does not belong to this school."
                });
            }
        }

        const normalizedAdmissionNumber = admission_number.trim();

        const existingStudent = await Student.findOne({
            school_id,
            admission_number: normalizedAdmissionNumber
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "A student with this admission number already exists."
            });
        }

        // Create student with status: "Pending"
        const student = await Student.create({
            school_id,
            parent_id: parent_id || null,
            admission_number: normalizedAdmissionNumber,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name?.trim() || "",
            gender,
            date_of_birth,
            class_name: class_name.trim(),
            arm: arm?.trim() || "",
            home_address: home_address || "",
            medical_information: medical_information || "",
            passport: passport || "",
            status: "Pending"
        });

        const populatedStudent = await Student.findById(student._id)
            .populate("parent_id")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Student registration submitted successfully.",
            student: populatedStudent
        });

    } catch (error) {
        console.error("REGISTER STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to register student.",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL STUDENTS
// =====================================================
exports.getStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const students = await Student.find({ school_id })
            .populate("parent_id")
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load students.",
            error: error.message
        });
    }
};

// =====================================================
// GET SINGLE STUDENT
// =====================================================
exports.getStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        })
            .populate("parent_id")
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error("GET STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student.",
            error: error.message
        });
    }
};

// =====================================================
// GET PENDING STUDENTS
// =====================================================
exports.getPendingStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Pending"
        })
            .populate("parent_id")
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET PENDING STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load pending students.",
            error: error.message
        });
    }
};

// =====================================================
// GET ACTIVE STUDENTS
// =====================================================
exports.getActiveStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Active"
        })
            .populate("parent_id")
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET ACTIVE STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load active students.",
            error: error.message
        });
    }
};

// =====================================================
// APPROVE STUDENT
// =====================================================
exports.approveStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const user_id =
            req.user?.id ||
            req.user?._id ||
            null;

        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id
            },
            {
                status: "Active",
                approved_by: user_id,
                approved_at: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student approved successfully.",
            student
        });

    } catch (error) {
        console.error("APPROVE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to approve student.",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE STUDENT
// =====================================================
exports.updateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const allowedFields = [
            "admission_number",
            "first_name",
            "last_name",
            "other_name",
            "gender",
            "date_of_birth",
            "class_name",
            "arm",
            "home_address",
            "medical_information",
            "passport"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.admission_number) {
            updates.admission_number =
                updates.admission_number.trim();
        }

        if (updates.first_name) {
            updates.first_name =
                updates.first_name.trim();
        }

        if (updates.last_name) {
            updates.last_name =
                updates.last_name.trim();
        }

        if (updates.other_name) {
            updates.other_name =
                updates.other_name.trim();
        }

        if (updates.class_name) {
            updates.class_name =
                updates.class_name.trim();
        }

        if (updates.arm) {
            updates.arm =
                updates.arm.trim();
        }

        if (updates.admission_number) {
            const duplicate = await Student.findOne({
                school_id,
                admission_number:
                    updates.admission_number,
                _id: {
                    $ne: req.params.id
                }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another student already uses this admission number."
                });
            }
        }

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                updates,
                {
                    new: true,
                    runValidators: true
                }
            ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student updated successfully.",
            student
        });

    } catch (error) {
        console.error("UPDATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update student.",
            error: error.message
        });
    }
};

// =====================================================
// SUSPEND STUDENT
// =====================================================
exports.suspendStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Suspended",
                    suspended_by:
                        req.user?.id ||
                        req.user?._id ||
                        null,
                    suspended_at: new Date()
                },
                {
                    new: true,
                    runValidators: true
                }
            ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student suspended successfully.",
            student
        });

    } catch (error) {
        console.error("SUSPEND STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to suspend student.",
            error: error.message
        });
    }
};

// =====================================================
// REINSTATE STUDENT
// =====================================================
exports.reinstateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Active",
                    suspended_by: null,
                    suspended_at: null,
                    suspension_reason: ""
                },
                {
                    new: true,
                    runValidators: true
                }
            ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student reinstated successfully.",
            student
        });

    } catch (error) {
        console.error("REINSTATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reinstate student.",
            error: error.message
        });
    }
};

// =====================================================
// GRADUATE STUDENT
// =====================================================
exports.graduateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Graduated"
                },
                {
                    new: true,
                    runValidators: true
                }
            ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student graduated successfully.",
            student
        });

    } catch (error) {
        console.error("GRADUATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to graduate student.",
            error: error.message
        });
    }
};

// =====================================================
// ARCHIVE STUDENT
// =====================================================
exports.archiveStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Archived",
                    archived_by:
                        req.user?.id ||
                        req.user?._id ||
                        null,
                    archived_at: new Date()
                },
                {
                    new: true,
                    runValidators: true
                }
            ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student archived successfully.",
            student
        });

    } catch (error) {
        console.error("ARCHIVE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to archive student.",
            error: error.message
        });
    }
};

// =====================================================
// DELETE STUDENT
// =====================================================
exports.deleteStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student =
            await Student.findOneAndDelete({
                _id: req.params.id,
                school_id
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("DELETE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete student.",
            error: error.message
        });
    }
};

// =====================================================
// LINK PARENT TO STUDENT
// =====================================================
exports.linkParentToStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const { parent_id } = req.body;

        if (!parent_id) {
            return res.status(400).json({
                success: false,
                message: "Parent ID is required."
            });
        }

        const parent = await Parent.findOne({
            _id: parent_id,
            school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found in this school."
            });
        }

        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id
            },
            {
                parent_id: parent._id
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent linked to student successfully.",
            student
        });

    } catch (error) {
        console.error("LINK PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to link parent.",
            error: error.message
        });
    }
};

// =====================================================
// UNLINK PARENT FROM STUDENT
// =====================================================
exports.unlinkParentFromStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id
            },
            {
                parent_id: null
            },
            {
                new: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent unlinked successfully.",
            student
        });

    } catch (error) {
        console.error("UNLINK PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to unlink parent.",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT'S PARENT
// =====================================================
exports.getStudentParent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        }).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent: student.parent_id || null
        });

    } catch (error) {
        console.error("GET STUDENT PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student's parent.",
            error: error.message
        });
    }
};

// =====================================================
// GET LOGGED-IN STUDENT PROFILE
// =====================================================
exports.getStudentProfile = async (req, res) => {
    try {
        const userId =
            req.user?.id ||
            req.user?._id;

        const studentId =
            req.user?.student_id;

        let student = null;

        if (studentId) {
            student = await Student.findById(studentId)
                .populate("parent_id")
                .lean();
        }

        if (!student && userId) {
            const user =
                await User.findById(userId).lean();

            if (user?.student_id) {
                student =
                    await Student.findById(user.student_id)
                        .populate("parent_id")
                        .lean();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });
        }

        if (
            req.user?.school_id &&
            student.school_id &&
            String(req.user.school_id) !==
                String(student.school_id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this student profile."
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error("GET STUDENT PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student profile.",
            error: error.message
        });
    }
};

// =====================================================
// GET LOGGED-IN STUDENT DASHBOARD
// =====================================================
exports.getStudentDashboardData = async (req, res) => {
    try {
        const userId =
            req.user?.id ||
            req.user?._id;

        const studentId =
            req.user?.student_id;

        let student = null;

        if (studentId) {
            student = await Student.findById(studentId)
                .populate("parent_id")
                .lean();
        }

        if (!student && userId) {
            const user =
                await User.findById(userId).lean();

            if (user?.student_id) {
                student =
                    await Student.findById(user.student_id)
                        .populate("parent_id")
                        .lean();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student record not found."
            });
        }

        if (
            req.user?.school_id &&
            student.school_id &&
            String(req.user.school_id) !==
                String(student.school_id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this student dashboard."
            });
        }

        const fullName = [
            student.first_name,
            student.other_name,
            student.last_name
        ]
            .filter(Boolean)
            .join(" ");

        return res.status(200).json({
            success: true,
            dashboard: {
                studentInfo: {
                    id: student._id,
                    fullName,
                    admissionNumber:
                        student.admission_number,
                    className:
                        student.class_name,
                    arm:
                        student.arm,
                    gender:
                        student.gender,
                    dateOfBirth:
                        student.date_of_birth,
                    admissionDate:
                        student.admission_date,
                    status:
                        student.status,
                    passport:
                        student.passport,
                    school_id:
                        student.school_id
                },

                parent: student.parent_id || null
            }
        });

    } catch (error) {
        console.error(
            "GET STUDENT DASHBOARD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load student dashboard.",
            error: error.message
        });
    }
};
// ============================================================
// backend/controllers/studentController.js
// IMPORTANT ADDITION:
// LINK A STUDENT TO A PARENT
// ============================================================
// ============================================================
// LINK STUDENT TO PARENT
// Principal / authorized school staff
// ============================================================

exports.linkStudentParent = async (req, res) => {

    try {

        const schoolId =
            req.user?.school_id;

        const studentId =
            req.params.id;

        const {
            parent_id
        } = req.body;


        if (!schoolId) {

            return res.status(400).json({

                success: false,

                message:
                    "Your account is not connected to a school."

            });

        }


        if (!parent_id) {

            return res.status(400).json({

                success: false,

                message:
                    "Parent ID is required."

            });

        }


        // ====================================================
        // FIND PARENT IN SAME SCHOOL
        // ====================================================

        const parent =
            await Parent.findOne({

                _id:
                    parent_id,

                school_id:
                    schoolId,

                status: "Active"

            });


        if (!parent) {

            return res.status(404).json({

                success: false,

                message:
                    "Parent not found in this school."

            });

        }


        // ====================================================
        // FIND STUDENT IN SAME SCHOOL
        // ====================================================

        const student =
            await Student.findOneAndUpdate(

                {
                    _id:
                        studentId,

                    school_id:
                        schoolId

                },

                {
                    parent_id:
                        parent._id
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Student successfully linked to parent.",

            student

        });


    } catch (error) {

        console.error(
            "LINK STUDENT PARENT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to link student to parent.",

            error:
                error.message

        });

    }

};
