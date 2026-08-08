
const Student = require("../models/student");
const Parent = require("../models/parent");

// =======================================
// Register Student
// =======================================
exports.registerStudent = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School account is not linked to a school."
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

        const existingStudent = await Student.findOne({
            school_id,
            admission_number
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "A student with this admission number already exists."
            });
        }

        // If a parent was supplied, make sure that parent
        // belongs to the same school.
        if (parent_id) {
            const parent = await Parent.findOne({
                _id: parent_id,
                school_id,
                status: "Active"
            });

            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Selected parent was not found in this school."
                });
            }
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
        const school_id = req.user.school_id;

        const filter = {
            school_id
        };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.class_name) {
            filter.class_name = req.query.class_name;
        }

        if (req.query.search) {
            const search = req.query.search.trim();

            filter.$or = [
                {
                    first_name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    last_name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    admission_number: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const students = await Student.find(filter)
            .populate(
                "parent_id",
                "full_name email phone status"
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
        console.error("GET STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Pending Students
// =======================================
exports.getPendingStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Pending"
        })
            .populate(
                "parent_id",
                "full_name email phone status"
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
        console.error("GET PENDING STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Active Students
// =======================================
exports.getActiveStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Active"
        })
            .populate(
                "parent_id",
                "full_name email phone status"
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
        console.error("GET ACTIVE STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Suspended Students
// =======================================
exports.getSuspendedStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Suspended"
        })
            .populate(
                "parent_id",
                "full_name email phone status"
            )
            .sort({
                suspended_at: -1
            });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET SUSPENDED STUDENTS ERROR:", error);

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
        }).populate(
            "parent_id",
            "full_name email phone address occupation status"
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
        console.error("GET STUDENT ERROR:", error);

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

        if (student.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending students can be approved."
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

    } catch (error) {
        console.error("APPROVE STUDENT ERROR:", error);

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

        const reason = req.body.reason || "";

        student.status = "Suspended";
        student.suspended_by = req.user.id;
        student.suspended_at = new Date();
        student.suspension_reason = reason;

        await student.save();

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

        if (student.status !== "Suspended") {
            return res.status(400).json({
                success: false,
                message: "Only suspended students can be reinstated."
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

        student.status = "Graduated";

        await student.save();

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

        student.status = "Archived";
        student.archived_by = req.user.id;
        student.archived_at = new Date();

        await student.save();

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
// Link Parent To Student
// =======================================
exports.linkParent = async (req, res) => {
    try {
        const { parent_id } = req.body;

        if (!parent_id) {
            return res.status(400).json({
                success: false,
                message: "Parent ID is required."
            });
        }

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

        const parent = await Parent.findOne({
            _id: parent_id,
            school_id: req.user.school_id,
            status: "Active"
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found in this school."
            });
        }

        student.parent_id = parent._id;

        await student.save();

        await student.populate(
            "parent_id",
            "full_name email phone status"
        );

        return res.status(200).json({
            success: true,
            message: "Parent linked to student successfully.",
            student
        });

    } catch (error) {
        console.error("LINK PARENT TO STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Unlink Parent From Student
// =======================================
exports.unlinkParent = async (req, res) => {
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

        student.parent_id = null;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Parent unlinked from student successfully.",
            student
        });

    } catch (error) {
        console.error("UNLINK PARENT FROM STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
