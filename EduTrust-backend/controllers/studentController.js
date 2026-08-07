const mongoose = require("mongoose");
const Student = require("../models/student");

// ======================================================
// Helper: Get School ID
// ======================================================
const getSchoolId = (req) => {
    return req.user && req.user.school_id
        ? req.user.school_id
        : null;
};


// ======================================================
// Register Student
// New students start as Pending
// ======================================================
exports.registerStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(403).json({
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
            parent_id,
            home_address,
            medical_information,
            passport
        } = req.body;

        // Required fields
        if (
            !admission_number ||
            !first_name ||
            !last_name ||
            !gender ||
            !date_of_birth ||
            !class_name
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide admission number, first name, last name, gender, date of birth and class."
            });
        }

        // Validate school ID
        if (!mongoose.Types.ObjectId.isValid(school_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid school account."
            });
        }

        // Check duplicate admission number inside this school
        const existingStudent = await Student.findOne({
            school_id,
            admission_number: admission_number.trim()
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message:
                    "A student with this admission number already exists."
            });
        }

        const student = await Student.create({
            school_id,
            parent_id: parent_id || null,
            admission_number: admission_number.trim(),
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name
                ? other_name.trim()
                : "",
            gender,
            date_of_birth,
            class_name: class_name.trim(),
            arm: arm ? arm.trim() : "",
            home_address: home_address || "",
            medical_information:
                medical_information || "",
            passport: passport || "",
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
                "Server error while registering student.",
            error: error.message
        });
    }
};


// ======================================================
// Get All Students
// ======================================================
exports.getAllStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(403).json({
                success: false,
                message: "School account could not be identified."
            });
        }

        const students = await Student.find({
            school_id
        })
            .populate(
                "parent_id",
                "full_name email phone"
            )
            .sort({
                created_at: -1
            });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET ALL STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error retrieving students.",
            error: error.message
        });
    }
};


// ======================================================
// Get Single Student
// ======================================================
exports.getStudentById = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(403).json({
                success: false,
                message: "School account could not be identified."
            });
        }

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        }).populate(
            "parent_id",
            "full_name email phone"
        );

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
        console.error(
            "GET STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error retrieving student.",
            error: error.message
        });
    }
};


// ======================================================
// Pending Students
// ======================================================
exports.getPendingStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

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
                "Server error retrieving pending students.",
            error: error.message
        });
    }
};


// ======================================================
// Active Students
// ======================================================
exports.getActiveStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Active"
        }).sort({
            first_name: 1,
            last_name: 1
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
                "Server error retrieving active students.",
            error: error.message
        });
    }
};


// ======================================================
// Suspended Students
// ======================================================
exports.getSuspendedStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Suspended"
        }).sort({
            suspended_at: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET SUSPENDED STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error retrieving suspended students.",
            error: error.message
        });
    }
};


// ======================================================
// Graduated Students
// ======================================================
exports.getGraduatedStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Graduated"
        }).sort({
            updated_at: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET GRADUATED STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error retrieving graduated students.",
            error: error.message
        });
    }
};


// ======================================================
// Archived Students
// ======================================================
exports.getArchivedStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Archived"
        }).sort({
            archived_at: -1
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET ARCHIVED STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error retrieving archived students.",
            error: error.message
        });
    }
};


// ======================================================
// Approve Student
// Pending → Active
// ======================================================
exports.approveStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message:
                    `Student cannot be approved because current status is ${student.status}.`
            });
        }

        student.status = "Active";
        student.approved_by = req.user.id;
        student.approved_at = new Date();

        await student.save();

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
                "Server error approving student.",
            error: error.message
        });
    }
};


// ======================================================
// Suspend Student
// Active → Suspended
// ======================================================
exports.suspendStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status !== "Active") {
            return res.status(400).json({
                success: false,
                message:
                    `Only active students can be suspended. Current status: ${student.status}.`
            });
        }

        student.status = "Suspended";
        student.suspended_by = req.user.id;
        student.suspended_at = new Date();
        student.suspension_reason =
            req.body.reason || "";

        await student.save();

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
                "Server error suspending student.",
            error: error.message
        });
    }
};


// ======================================================
// Reinstate Student
// Suspended → Active
// ======================================================
exports.reinstateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status !== "Suspended") {
            return res.status(400).json({
                success: false,
                message:
                    "Only suspended students can be reinstated."
            });
        }

        student.status = "Active";
        student.suspended_by = null;
        student.suspended_at = null;
        student.suspension_reason = "";

        await student.save();

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
                "Server error reinstating student.",
            error: error.message
        });
    }
};


// ======================================================
// Graduate Student
// Active → Graduated
// ======================================================
exports.graduateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status !== "Active") {
            return res.status(400).json({
                success: false,
                message:
                    "Only active students can be graduated."
            });
        }

        student.status = "Graduated";

        await student.save();

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
                "Server error graduating student.",
            error: error.message
        });
    }
};


// ======================================================
// Archive Student
// NO DELETE ROUTE
// ======================================================
exports.archiveStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status === "Archived") {
            return res.status(400).json({
                success: false,
                message:
                    "Student is already archived."
            });
        }

        student.status = "Archived";
        student.archived_by = req.user.id;
        student.archived_at = new Date();

        await student.save();

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
                "Server error archiving student.",
            error: error.message
        });
    }
};
