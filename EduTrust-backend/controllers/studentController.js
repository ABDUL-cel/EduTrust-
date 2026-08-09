const Student = require("../models/student");

// =======================================
// Register Student
// =======================================
exports.registerStudent = async (req, res) => {
    try {
        const school_id = req.user.school_id;

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

        if (
            !admission_number ||
            !first_name ||
            !last_name ||
            !gender ||
            !class_name
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Admission number, first name, last name, gender and class are required."
            });
        }

        const existingStudent = await Student.findOne({
            school_id,
            admission_number: admission_number.trim()
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "A student with this admission number already exists."
            });
        }

        const student = await Student.create({
            school_id,
            admission_number: admission_number.trim(),
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name ? other_name.trim() : "",
            gender,
            date_of_birth: date_of_birth || null,
            class_name,
            arm: arm || "",
            home_address: home_address || "",
            medical_information: medical_information || "",
            passport: passport || "",
            status: "Pending"
        });

        return res.status(201).json({
            success: true,
            message: "Student registration submitted successfully.",
            student
        });

    } catch (error) {
        console.error("REGISTER STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get All Students
// =======================================
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Single Student
// =======================================
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });

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
            message: error.message
        });
    }
};


// =======================================
// Pending Students
// =======================================
exports.getPendingStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Pending"
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET PENDING STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Active Students
// =======================================
exports.getActiveStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Active"
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET ACTIVE STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Approve Student
// =======================================
exports.approveStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                status: "Active"
            },
            {
                new: true,
                runValidators: true
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
            message: "Student approved successfully.",
            student
        });

    } catch (error) {
        console.error("APPROVE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Update Student
// =======================================
exports.updateStudent = async (req, res) => {
    try {
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

        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
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
            message: error.message
        });
    }
};


// =======================================
// Suspend Student
// =======================================
exports.suspendStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                status: "Suspended"
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
            message: "Student suspended successfully.",
            student
        });

    } catch (error) {
        console.error("SUSPEND STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Reinstate Student
// =======================================
exports.reinstateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                status: "Active"
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
            message: "Student reinstated successfully.",
            student
        });

    } catch (error) {
        console.error("REINSTATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Graduate Student
// =======================================
exports.graduateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                status: "Graduated"
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
            message: "Student graduated successfully.",
            student
        });

    } catch (error) {
        console.error("GRADUATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Archive Student
// =======================================
exports.archiveStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                status: "Archived"
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
            message: "Student archived successfully.",
            student
        });

    } catch (error) {
        console.error("ARCHIVE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Delete Student
// =======================================
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({
            _id: req.params.id,
            school_id: req.user.school_id
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
            message: error.message
        });
    }
};
