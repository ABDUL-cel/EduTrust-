const Student = require("../models/student");
const User = require("../models/User");

// =======================================
// Register Student
// Principal / authenticated school staff
// =======================================
exports.registerStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School account could not be identified."
            });
        }

        const {
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

        // =======================================
        // REQUIRED FIELDS
        // =======================================
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

        // =======================================
        // CHECK DUPLICATE ADMISSION NUMBER
        // =======================================
        const normalizedAdmissionNumber =
            admission_number.trim();

        const existingStudent = await Student.findOne({
            school_id,
            admission_number: normalizedAdmissionNumber
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message:
                    "A student with this admission number already exists."
            });
        }

        // =======================================
        // CREATE STUDENT
        // =======================================
        const student = await Student.create({
            school_id,

            admission_number:
                normalizedAdmissionNumber,

            first_name:
                first_name.trim(),

            last_name:
                last_name.trim(),

            other_name:
                other_name
                    ? other_name.trim()
                    : "",

            gender,

            date_of_birth,

            class_name:
                class_name.trim(),

            arm:
                arm
                    ? arm.trim()
                    : "",

            home_address:
                home_address
                    ? home_address.trim()
                    : "",

            medical_information:
                medical_information
                    ? medical_information.trim()
                    : "",

            passport:
                passport || "",

            status: "Pending"
        });

        return res.status(201).json({
            success: true,
            message:
                "Student registration submitted successfully.",
            student
        });

    } catch (error) {
        console.error(
            "REGISTER STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to register student.",
            error: error.message
        });
    }
};


// =======================================
// Get All Students
// =======================================
exports.getStudents = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const students = await Student.find({
            school_id
        }).sort({
            created_at: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load students.",
            error: error.message
        });
    }
};


// =======================================
// Get Single Student
// =======================================
exports.getStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error(
            "GET STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load student.",
            error: error.message
        });
    }
};


// =======================================
// Get Pending Students
// =======================================
exports.getPendingStudents = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const students = await Student.find({
            school_id,
            status: "Pending"
        }).sort({
            created_at: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET PENDING STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load pending students.",
            error: error.message
        });
    }
};


// =======================================
// Get Active Students
// =======================================
exports.getActiveStudents = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const students = await Student.find({
            school_id,
            status: "Active"
        }).sort({
            created_at: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET ACTIVE STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load active students.",
            error: error.message
        });
    }
};


// =======================================
// Approve Student
// =======================================
exports.approveStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const user_id =
            req.user?.id ||
            req.user?._id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id
            },
            {
                status: "Active",
                approved_by: user_id || null,
                approved_at: new Date()
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
                "Student approved successfully.",
            student
        });

    } catch (error) {
        console.error(
            "APPROVE STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to approve student.",
            error: error.message
        });
    }
};


// =======================================
// Update Student
// =======================================
exports.updateStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

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
                updates[field] =
                    req.body[field];
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

        // =======================================
        // CHECK ADMISSION NUMBER DUPLICATE
        // =======================================
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
                "Student updated successfully.",
            student
        });

    } catch (error) {
        console.error(
            "UPDATE STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update student.",
            error: error.message
        });
    }
};


// =======================================
// Suspend Student
// =======================================
exports.suspendStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const user_id =
            req.user?.id ||
            req.user?._id;

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Suspended",
                    suspended_by:
                        user_id || null,
                    suspended_at:
                        new Date()
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
                "Student suspended successfully.",
            student
        });

    } catch (error) {
        console.error(
            "SUSPEND STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to suspend student.",
            error: error.message
        });
    }
};


// =======================================
// Reinstate Student
// =======================================
exports.reinstateStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

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
                "Student reinstated successfully.",
            student
        });

    } catch (error) {
        console.error(
            "REINSTATE STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to reinstate student.",
            error: error.message
        });
    }
};


// =======================================
// Graduate Student
// =======================================
exports.graduateStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

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
                "Student graduated successfully.",
            student
        });

    } catch (error) {
        console.error(
            "GRADUATE STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to graduate student.",
            error: error.message
        });
    }
};


// =======================================
// Archive Student
// =======================================
exports.archiveStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const user_id =
            req.user?.id ||
            req.user?._id;

        const student =
            await Student.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Archived",
                    archived_by:
                        user_id || null,
                    archived_at:
                        new Date()
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
                "Student archived successfully.",
            student
        });

    } catch (error) {
        console.error(
            "ARCHIVE STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to archive student.",
            error: error.message
        });
    }
};


// =======================================
// Delete Student
// =======================================
exports.deleteStudent = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        const student =
            await Student.findOneAndDelete({
                _id: req.params.id,
                school_id
            });

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
                "Student deleted successfully."
        });

    } catch (error) {
        console.error(
            "DELETE STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete student.",
            error: error.message
        });
    }
};


// =======================================
// Get Logged-in Student Profile
// =======================================
exports.getStudentProfile = async (req, res) => {
    try {
        const userId =
            req.user?.id ||
            req.user?._id;

        const studentId =
            req.user?.student_id;

        if (!userId && !studentId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        let student = null;

        // =======================================
        // FIND BY STUDENT ID
        // =======================================
        if (studentId) {
            student =
                await Student.findById(
                    studentId
                ).lean();
        }

        // =======================================
        // FALLBACK THROUGH USER
        // =======================================
        if (!student && userId) {
            const user =
                await User.findById(
                    userId
                ).lean();

            if (user?.student_id) {
                student =
                    await Student.findById(
                        user.student_id
                    ).lean();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student profile not found."
            });
        }

        // =======================================
        // MULTI-SCHOOL SECURITY
        // =======================================
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
        console.error(
            "GET STUDENT PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load student profile.",
            error: error.message
        });
    }
};


// =======================================
// Get Student Dashboard Summary Data
// =======================================
exports.getStudentDashboardData = async (req, res) => {
    try {
        const userId =
            req.user?.id ||
            req.user?._id;

        const studentId =
            req.user?.student_id;

        if (!userId && !studentId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        let student = null;

        // =======================================
        // FIND BY STUDENT ID
        // =======================================
        if (studentId) {
            student =
                await Student.findById(
                    studentId
                ).lean();
        }

        // =======================================
        // FALLBACK THROUGH USER
        // =======================================
        if (!student && userId) {
            const user =
                await User.findById(
                    userId
                ).lean();

            if (user?.student_id) {
                student =
                    await Student.findById(
                        user.student_id
                    ).lean();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student record not found."
            });
        }

        // =======================================
        // MULTI-SCHOOL SECURITY
        // =======================================
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

        // =======================================
        // FULL NAME
        // =======================================
        const fullName = [
            student.first_name,
            student.other_name,
            student.last_name
        ]
            .filter(Boolean)
            .join(" ");

        // =======================================
        // DASHBOARD RESPONSE
        // =======================================
        return res.status(200).json({
            success: true,

            dashboard: {
                studentInfo: {
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
                }
            }
        });

    } catch (error) {
        console.error(
            "GET STUDENT DASHBOARD DATA ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load student dashboard.",
            error: error.message
        });
    }// =======================================
// PUBLIC SCHOOL SEARCH
// Used by students/parents during registration
// =======================================
exports.searchSchools = async (req, res) => {
    try {
        const search = req.query.search?.trim();

        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Please enter a school name."
            });
        }

        const School = require("../models/school");

        const schools = await School.find({
            name: {
                $regex: search,
                $options: "i"
            }
        })
            .select(
                "_id name address phone school_type logo"
            )
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            count: schools.length,
            schools
        });

    } catch (error) {
        console.error(
            "SEARCH SCHOOLS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to search schools.",
            error: error.message
        });
    }
};
};
