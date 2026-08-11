const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");
const School = require("../models/school");

// =====================================================
// REGISTER PARENT
// =====================================================
const registerParent = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            other_name,
            relationship,
            email,
            phone,
            alternate_phone,
            home_address,
            occupation,
            passport,
            status,
            school_id
        } = req.body;

        let targetSchoolId = school_id;

        if (!targetSchoolId && req.user) {
            targetSchoolId =
                req.user.school_id ||
                req.user.schoolId;
        }

        if (!targetSchoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "School ID is required to register a parent."
            });
        }

        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !relationship?.trim() ||
            !phone?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship and phone are required."
            });
        }

        const existingParent = await Parent.findOne({
            school_id: targetSchoolId,
            phone: phone.trim()
        });

        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number already exists in this school."
            });
        }

        const parent = await Parent.create({
            school_id: targetSchoolId,

            first_name: first_name.trim(),
            last_name: last_name.trim(),

            other_name:
                other_name?.trim() || "",

            relationship:
                relationship.trim(),

            email:
                email?.trim().toLowerCase() || "",

            phone:
                phone.trim(),

            alternate_phone:
                alternate_phone?.trim() || "",

            home_address:
                home_address?.trim() || "",

            occupation:
                occupation?.trim() || "",

            passport:
                passport || "",

            status:
                status || "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Parent created successfully.",
            parent
        });

    } catch (error) {
        console.error(
            "REGISTER PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to register parent.",
            error: error.message
        });
    }
};


// =====================================================
// PARENT LOGIN
// =====================================================
const loginParent = async (req, res) => {
    try {
        const {
            phone,
            email
        } = req.body;

        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone or email is required."
            });
        }

        const conditions = [];

        if (phone?.trim()) {
            conditions.push({
                phone: phone.trim()
            });
        }

        if (email?.trim()) {
            conditions.push({
                email:
                    email.trim().toLowerCase()
            });
        }

        const parent = await Parent.findOne({
            $or: conditions
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent account not found."
            });
        }

        if (parent.status !== "Active") {
            return res.status(403).json({
                success: false,
                message:
                    "This parent account is inactive."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent account found.",
            parent
        });

    } catch (error) {
        console.error(
            "PARENT LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Parent login failed.",
            error: error.message
        });
    }
};


// =====================================================
// GET PARENT PROFILE
// =====================================================
const getParentProfile = async (req, res) => {
    try {
        const parentId =
            req.user?.parent_id ||
            req.user?.id ||
            req.user?._id;

        if (!parentId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        const parent =
            await Parent.findById(parentId)
                .lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        return res.status(200).json({
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
            message:
                "Failed to load parent profile.",
            error: error.message
        });
    }
};


// =====================================================
// GET ALL PARENTS FOR PRINCIPAL'S SCHOOL
// =====================================================
const getParents = async (req, res) => {
    try {
        const schoolId =
            req.user?.school_id;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const parents =
            await Parent.find({
                school_id: schoolId
            })
                .sort({
                    created_at: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            count: parents.length,
            parents
        });

    } catch (error) {
        console.error(
            "GET PARENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parents.",
            error: error.message
        });
    }
};


// =====================================================
// GET ONE PARENT
// =====================================================
const getParentById = async (req, res) => {
    try {
        const schoolId =
            req.user?.school_id;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const parent =
            await Parent.findOne({
                _id: req.params.id,
                school_id: schoolId
            }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {
        console.error(
            "GET PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent.",
            error: error.message
        });
    }
};


// =====================================================
// ASSIGN PARENT TO STUDENT
// PRINCIPAL / SCHOOL STAFF
// =====================================================
const assignParentToStudent = async (req, res) => {
    try {
        const schoolId =
            req.user?.school_id;

        const {
            student_id,
            parent_id
        } = req.body;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        if (!student_id || !parent_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Student ID and parent ID are required."
            });
        }

        // ---------------------------------------------
        // FIND STUDENT IN SAME SCHOOL
        // ---------------------------------------------
        const student =
            await Student.findOne({
                _id: student_id,
                school_id: schoolId
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found in your school."
            });
        }

        // ---------------------------------------------
        // FIND PARENT IN SAME SCHOOL
        // ---------------------------------------------
        const parent =
            await Parent.findOne({
                _id: parent_id,
                school_id: schoolId
            });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found in your school."
            });
        }

        // ---------------------------------------------
        // LINK
        // ---------------------------------------------
        student.parent_id = parent._id;

        await student.save();

        return res.status(200).json({
            success: true,
            message:
                "Parent linked to student successfully.",
            student
        });

    } catch (error) {
        console.error(
            "ASSIGN PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to link parent to student.",
            error: error.message
        });
    }
};


// =====================================================
// REMOVE PARENT FROM STUDENT
// =====================================================
const removeParentFromStudent = async (req, res) => {
    try {
        const schoolId =
            req.user?.school_id;

        const student =
            await Student.findOne({
                _id: req.params.studentId,
                school_id: schoolId
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }

        student.parent_id = null;

        await student.save();

        return res.status(200).json({
            success: true,
            message:
                "Parent removed from student.",
            student
        });

    } catch (error) {
        console.error(
            "REMOVE PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to remove parent.",
            error: error.message
        });
    }
};


// =====================================================
// GET STUDENT'S PARENT
// =====================================================
const getStudentParent = async (req, res) => {
    try {
        const schoolId =
            req.user?.school_id;

        const student =
            await Student.findOne({
                _id: req.params.studentId,
                school_id: schoolId
            })
                .populate("parent_id")
                .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent:
                student.parent_id || null
        });

    } catch (error) {
        console.error(
            "GET STUDENT PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load student's parent.",
            error: error.message
        });
    }
};


// =====================================================
// GET PARENT'S CHILDREN
// =====================================================
const getParentChildren = async (req, res) => {
    try {
        const parentId =
            req.user?.parent_id;

        if (!parentId) {
            return res.status(400).json({
                success: false,
                message:
                    "This account is not linked to a parent profile."
            });
        }

        const parent =
            await Parent.findById(
                parentId
            ).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        const students =
            await Student.find({
                parent_id: parent._id,
                school_id: parent.school_id
            })
                .sort({
                    first_name: 1,
                    last_name: 1
                })
                .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET PARENT CHILDREN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent's children.",
            error: error.message
        });
    }
};


// =====================================================
// GET PARENT DASHBOARD
// =====================================================
const getParentDashboard = async (req, res) => {
    try {
        const parentId =
            req.user?.parent_id;

        if (!parentId) {
            return res.status(400).json({
                success: false,
                message:
                    "Parent account is not linked."
            });
        }

        const parent =
            await Parent.findById(
                parentId
            ).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        const children =
            await Student.find({
                parent_id: parent._id,
                school_id: parent.school_id
            })
                .select(
                    "first_name last_name other_name admission_number class_name arm status passport"
                )
                .sort({
                    first_name: 1
                })
                .lean();

        return res.status(200).json({
            success: true,

            dashboard: {
                parent: {
                    id: parent._id,
                    fullName: [
                        parent.first_name,
                        parent.other_name,
                        parent.last_name
                    ]
                        .filter(Boolean)
                        .join(" "),
                    relationship:
                        parent.relationship,
                    phone: parent.phone,
                    email: parent.email,
                    passport: parent.passport
                },

                children
            }
        });

    } catch (error) {
        console.error(
            "GET PARENT DASHBOARD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent dashboard.",
            error: error.message
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================
module.exports = {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    assignParentToStudent,
    removeParentFromStudent,
    getStudentParent,
    getParentChildren,
    getParentDashboard
};
