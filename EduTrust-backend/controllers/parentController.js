

const Parent = require("../models/parent");
const Student = require("../models/student");

// =======================================
// Register Parent
// =======================================
exports.registerParent = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School account is not linked to a school."
            });
        }

        const {
            full_name,
            email,
            phone,
            address,
            occupation
        } = req.body;

        if (!full_name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Parent name and phone are required."
            });
        }

        const existingParent = await Parent.findOne({
            school_id,
            phone
        });

        if (existingParent) {
            return res.status(400).json({
                success: false,
                message: "A parent with this phone number already exists."
            });
        }

        const parent = await Parent.create({
            school_id,
            full_name,
            email: email || "",
            phone,
            address: address || "",
            occupation: occupation || "",
            status: "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Parent registered successfully.",
            parent
        });

    } catch (error) {
        console.error("REGISTER PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get All Parents
// =======================================
exports.getParents = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const filter = {
            school_id
        };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.search) {
            const search = req.query.search.trim();

            filter.$or = [
                {
                    full_name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    phone: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const parents = await Parent.find(filter)
            .sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            count: parents.length,
            parents
        });

    } catch (error) {
        console.error("GET PARENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Single Parent
// =======================================
exports.getParent = async (req, res) => {
    try {
        const parent = await Parent.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        const students = await Student.find({
            school_id: req.user.school_id,
            parent_id: parent._id
        }).sort({
            created_at: -1
        });

        return res.status(200).json({
            success: true,
            parent,
            students
        });

    } catch (error) {
        console.error("GET PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Update Parent
// =======================================
exports.updateParent = async (req, res) => {
    try {
        const allowedFields = [
            "full_name",
            "email",
            "phone",
            "address",
            "occupation"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const parent = await Parent.findOneAndUpdate(
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

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent updated successfully.",
            parent
        });

    } catch (error) {
        console.error("UPDATE PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Link Parent To Student
// =======================================
exports.linkParentToStudent = async (req, res) => {
    try {
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required."
            });
        }

        const parent = await Parent.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        const student = await Student.findOne({
            _id: student_id,
            school_id: req.user.school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        student.parent_id = parent._id;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Parent linked to student successfully.",
            student
        });

    } catch (error) {
        console.error("LINK PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Unlink Parent From Student
// =======================================
exports.unlinkParentFromStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.studentId,
            school_id: req.user.school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (
            !student.parent_id ||
            student.parent_id.toString() !== req.params.id
        ) {
            return res.status(400).json({
                success: false,
                message: "This parent is not linked to this student."
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
        console.error("UNLINK PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Suspend Parent
// =======================================
exports.suspendParent = async (req, res) => {
    try {
        const parent = await Parent.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        parent.status = "Suspended";

        await parent.save();

        return res.status(200).json({
            success: true,
            message: "Parent suspended successfully.",
            parent
        });

    } catch (error) {
        console.error("SUSPEND PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Activate Parent
// =======================================
exports.activateParent = async (req, res) => {
    try {
        const parent = await Parent.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        parent.status = "Active";

        await parent.save();

        return res.status(200).json({
            success: true,
            message: "Parent activated successfully.",
            parent
        });

    } catch (error) {
        console.error("ACTIVATE PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
