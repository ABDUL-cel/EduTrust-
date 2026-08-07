const Student = require("../models/student");

// =======================================
// Helper: Get School ID
// =======================================

function getSchoolId(req) {
    return req.user?.school_id || req.user?.id;
}


// =======================================
// Register Student
// Status: Pending
// =======================================

exports.registerStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(401).json({
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
            passport,
            parent_id
        } = req.body;

        // Validate required fields
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
                message: "Please fill in all required student fields."
            });
        }

        // Check duplicate admission number
        const existingStudent = await Student.findOne({
            admission_number
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "A student with this admission number already exists."
            });
        }

        const student = await Student.create({
            school_id,
            parent_id: parent_id || null,
            admission_number,
            first_name,
            last_name,
            other_name: other_name || "",
            gender,
            date_of_birth,
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

    } catch (err) {
        console.error("REGISTER STUDENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while registering student.",
            error: err.message
        });
    }
};


// =======================================
// Get Pending Students
// =======================================

exports.getPendingStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(401).json({
                success: false,
                message: "School account could not be identified."
            });
        }

        const students = await Student.find({
            school_id,
            status: "Pending"
        })
            .populate("parent_id")
            .sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (err) {
        console.error("GET PENDING STUDENTS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while retrieving pending students.",
            error: err.message
        });
    }
};


// =======================================
// Get Active Students
// =======================================

exports.getActiveStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(401).json({
                success: false,
                message: "School account could not be identified."
            });
        }

        const students = await Student.find({
            school_id,
            status: "Active"
        })
            .populate("parent_id")
            .sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (err) {
        console.error("GET ACTIVE STUDENTS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while retrieving active students.",
            error: err.message
        });
    }
};


// =======================================
// Approve Student
// Pending → Active
// =======================================

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
                message: `Student cannot be approved because current status is ${student.status}.`
            });
        }

        student.status = "Active";
        student.approved_by = req.user.id;
        student.approved_at = new Date();

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student approved successfully.",
            student
        });

    } catch (err) {
        console.error("APPROVE STUDENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while approving student.",
            error: err.message
        });
    }
};


// =======================================
// Suspend Student
// Active → Suspended
// =======================================

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
                message: `Student cannot be suspended because current status is ${student.status}.`
            });
        }

        student.status = "Suspended";
        student.suspended_by = req.user.id;
        student.suspended_at = new Date();
        student.suspension_reason = req.body.reason || "";

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student suspended successfully.",
            student
        });

    } catch (err) {
        console.error("SUSPEND STUDENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while suspending student.",
            error: err.message
        });
    }
};


// =======================================
// Reinstate Student
// Suspended → Active
// =======================================

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
                message: `Student cannot be reinstated because current status is ${student.status}.`
            });
        }

        student.status = "Active";
        student.suspended_by = null;
        student.suspended_at = null;
        student.suspension_reason = "";

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student reinstated successfully.",
            student
        });

    } catch (err) {
        console.error("REINSTATE STUDENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while reinstating student.",
            error: err.message
        });
    }
};


// =======================================
// Graduate Student
// Active → Graduated
// =======================================

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
                message: `Student cannot be graduated because current status is ${student.status}.`
            });
        }

        student.status = "Graduated";

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student graduated successfully.",
            student
        });

    } catch (err) {
        console.error("GRADUATE STUDENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while graduating student.",
            error: err.message
        });
    }
};


// =======================================
// Archive Student
// No DELETE
// =======================================

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

        student.status = "Archived";
        student.archived_by = req.user.id;
        student.archived_at = new Date();

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student archived successfully.",
            student
        });

    } catch (err) {
        console.error("ARCHIVE STUDENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error while archiving student.",
            error: err.message
        });
    }
};
