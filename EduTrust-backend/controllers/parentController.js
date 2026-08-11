const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");
const School = require("../models/school");

// ======================================================
// HELPER: GET SCHOOL ID FROM AUTHENTICATED USER
// ======================================================
const getSchoolId = async (req) => {
    if (!req.user) return null;

    if (req.user.school_id) {
        return req.user.school_id;
    }

    const userId = req.user.id || req.user._id;

    if (!userId) return null;

    const user = await User.findById(userId).lean();

    return user?.school_id || user?.schoolId || user?._id || null;
};


// ======================================================
// REGISTER PARENT
// ======================================================
exports.registerParent = async (req, res) => {
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

        if (!targetSchoolId) {
            targetSchoolId = await getSchoolId(req);
        }

        if (!targetSchoolId) {
            return res.status(400).json({
                success: false,
                message: "School ID is required."
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
            other_name: other_name?.trim() || "",
            relationship: relationship.trim(),
            email: email?.toLowerCase().trim() || "",
            phone: phone.trim(),
            alternate_phone: alternate_phone?.trim() || "",
            home_address: home_address?.trim() || "",
            occupation: occupation?.trim() || "",
            passport: passport || "",
            status: status || "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Parent created successfully.",
            parent
        });

    } catch (error) {
        console.error("REGISTER PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to register parent.",
            error: error.message
        });
    }
};


// ======================================================
// PARENT LOGIN LOOKUP
// ======================================================
exports.loginParent = async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message: "Phone or email is required."
            });
        }

        const conditions = [];

        if (phone) {
            conditions.push({
                phone: phone.trim()
            });
        }

        if (email) {
            conditions.push({
                email: email.toLowerCase().trim()
            });
        }

        const parent = await Parent.findOne({
            $or: conditions
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent account not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent account found.",
            parent
        });

    } catch (error) {
        console.error("PARENT LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Parent login failed.",
            error: error.message
        });
    }
};


// ======================================================
// GET LOGGED-IN PARENT PROFILE
// ======================================================
exports.getParentProfile = async (req, res) => {
    try {
        const userId =
            req.user?.id ||
            req.user?._id;

        const parentId =
            req.user?.parent_id;

        let parent = null;

        if (parentId) {
            parent = await Parent.findById(parentId).lean();
        }

        if (!parent && userId) {
            parent = await Parent.findOne({
                user_id: userId
            }).lean();
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {
        console.error("GET PARENT PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load parent profile.",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL PARENTS
// ======================================================
exports.getParents = async (req, res) => {
    try {
        const schoolId = await getSchoolId(req);

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const parents = await Parent.find({
            school_id: schoolId
        })
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: parents.length,
            parents
        });

    } catch (error) {
        console.error("GET PARENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load parents.",
            error: error.message
        });
    }
};


// ======================================================
// GET ONE PARENT
// ======================================================
exports.getParentById = async (req, res) => {
    try {
        const schoolId = await getSchoolId(req);

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const parent = await Parent.findOne({
            _id: req.params.id,
            school_id: schoolId
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {
        console.error("GET PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load parent.",
            error: error.message
        });
    }
};


// ======================================================
// SEARCH SCHOOLS
// PUBLIC
// ======================================================
exports.searchSchools = async (req, res) => {
    try {
        const search =
            String(req.query.search || "").trim();

        if (search.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter at least 2 characters."
            });
        }

        const schools = await School.find({
            status: "Active",
            name: {
                $regex: search,
                $options: "i"
            }
        })
            .select(
                "_id name email address school_type logo website"
            )
            .sort({ name: 1 })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            count: schools.length,
            schools
        });

    } catch (error) {
        console.error("SEARCH SCHOOLS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to search schools.",
            error: error.message
        });
    }
};


// ======================================================
// LINK STUDENT TO PARENT
// Principal selects parent + student
// ======================================================
exports.linkStudentToParent = async (req, res) => {
    try {
        const {
            parent_id,
            student_id
        } = req.body;

        if (!parent_id || !student_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Parent ID and student ID are required."
            });
        }

        const schoolId = await getSchoolId(req);

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        // Find parent belonging to this school
        const parent = await Parent.findOne({
            _id: parent_id,
            school_id: schoolId
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        // Find student belonging to this school
        const student = await Student.findOne({
            _id: student_id,
            school_id: schoolId
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Link student
        student.parent_id = parent._id;

        await student.save();

        return res.status(200).json({
            success: true,
            message:
                "Student successfully linked to parent.",
            student
        });

    } catch (error) {
        console.error(
            "LINK STUDENT TO PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to link student to parent.",
            error: error.message
        });
    }
};


// ======================================================
// UNLINK STUDENT FROM PARENT
// ======================================================
exports.unlinkStudentFromParent = async (req, res) => {
    try {
        const {
            student_id
        } = req.body;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required."
            });
        }

        const schoolId = await getSchoolId(req);

        const student = await Student.findOne({
            _id: student_id,
            school_id: schoolId
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
            message:
                "Student successfully unlinked from parent."
        });

    } catch (error) {
        console.error(
            "UNLINK STUDENT FROM PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to unlink student.",
            error: error.message
        });
    }
};


// ======================================================
// GET CHILDREN OF LOGGED-IN PARENT
// ======================================================
exports.getMyChildren = async (req, res) => {
    try {
        const parentId =
            req.user?.parent_id;

        const userId =
            req.user?.id ||
            req.user?._id;

        let parent = null;

        if (parentId) {
            parent = await Parent.findById(parentId);
        }

        if (!parent && userId) {
            parent = await Parent.findOne({
                user_id: userId
            });
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        const students = await Student.find({
            parent_id: parent._id,
            school_id: parent.school_id
        })
            .sort({ first_name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            children: students
        });

    } catch (error) {
        console.error(
            "GET MY CHILDREN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load children.",
            error: error.message
        });
    }
};


// ======================================================
// GET ONE CHILD FOR LOGGED-IN PARENT
// ======================================================
exports.getMyChild = async (req, res) => {
    try {
        const parentId =
            req.user?.parent_id;

        if (!parentId) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent account is not linked."
            });
        }

        const student = await Student.findOne({
            _id: req.params.studentId,
            parent_id: parentId
        }).lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found or not linked to this parent."
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error(
            "GET MY CHILD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load child.",
            error: error.message
        });
    }
};
