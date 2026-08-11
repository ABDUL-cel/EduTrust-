const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");
const School = require("../models/school");

// ======================================================
// HELPER: GET AUTHENTICATED USER
// ======================================================

async function getAuthenticatedUser(req) {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
        return null;
    }

    return await User.findById(userId)
        .select("-password")
        .lean();
}


// ======================================================
// HELPER: GET PARENT FROM AUTHENTICATED USER
// ======================================================

async function getAuthenticatedParent(req) {
    const user = await getAuthenticatedUser(req);

    if (!user) {
        return {
            user: null,
            parent: null
        };
    }

    let parent = null;

    if (user.parent_id) {
        parent = await Parent.findById(
            user.parent_id
        ).lean();
    }

    return {
        user,
        parent
    };
}


// ======================================================
// REGISTER PARENT
// PUBLIC
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
            school_id
        } = req.body;

        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !relationship?.trim() ||
            !phone?.trim() ||
            !school_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship, phone and school are required."
            });
        }

        // ----------------------------------------------
        // CHECK SCHOOL
        // ----------------------------------------------

        const school = await School.findOne({
            _id: school_id,
            status: "Active"
        }).lean();

        if (!school) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected school was not found or is not active."
            });
        }

        const normalizedPhone =
            phone.trim();

        const normalizedEmail =
            email
                ? email.trim().toLowerCase()
                : "";

        // ----------------------------------------------
        // DUPLICATE PHONE
        // ----------------------------------------------

        const existingPhone =
            await Parent.findOne({
                school_id,
                phone: normalizedPhone
            });

        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number already exists in this school."
            });
        }

        // ----------------------------------------------
        // DUPLICATE EMAIL
        // ----------------------------------------------

        if (normalizedEmail) {
            const existingEmail =
                await Parent.findOne({
                    school_id,
                    email: normalizedEmail
                });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A parent with this email already exists in this school."
                });
            }
        }

        // ----------------------------------------------
        // CREATE PARENT
        // ----------------------------------------------

        const parent =
            await Parent.create({
                school_id,

                first_name:
                    first_name.trim(),

                last_name:
                    last_name.trim(),

                other_name:
                    other_name
                        ? other_name.trim()
                        : "",

                relationship:
                    relationship.trim(),

                email:
                    normalizedEmail,

                phone:
                    normalizedPhone,

                alternate_phone:
                    alternate_phone
                        ? alternate_phone.trim()
                        : "",

                home_address:
                    home_address
                        ? home_address.trim()
                        : "",

                occupation:
                    occupation
                        ? occupation.trim()
                        : "",

                passport:
                    passport || "",

                status: "Active"
            });

        return res.status(201).json({
            success: true,
            message:
                "Parent registration completed successfully.",
            parent
        });

    } catch (error) {
        console.error(
            "REGISTER PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to register parent.",
            error: error.message
        });
    }
};


// ======================================================
// PARENT LOGIN LOOKUP
// ======================================================

exports.loginParent = async (req, res) => {
    try {
        const {
            phone,
            email
        } = req.body;

        if (
            !phone?.trim() &&
            !email?.trim()
        ) {
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

        const parent =
            await Parent.findOne({
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
                    "This parent account is not active."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Parent account found.",
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
                "Parent login lookup failed.",
            error: error.message
        });
    }
};


// ======================================================
// GET PARENT PROFILE
// AUTHENTICATED PARENT
// ======================================================

exports.getParentProfile = async (req, res) => {
    try {
        const {
            user,
            parent
        } =
            await getAuthenticatedParent(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        if (user.role !== "Parent") {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not a parent account."
            });
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile is not linked to this account."
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


// ======================================================
// GET ALL PARENTS
// PRINCIPAL / SCHOOL STAFF
// ======================================================

exports.getParents = async (req, res) => {
    try {
        const user =
            await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        const schoolId =
            user.school_id;

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


// ======================================================
// GET ONE PARENT
// PRINCIPAL / SCHOOL STAFF
// ======================================================

exports.getParentById = async (req, res) => {
    try {
        const user =
            await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        if (!user.school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const parent =
            await Parent.findOne({
                _id: req.params.id,
                school_id: user.school_id
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


// ======================================================
// SEARCH SCHOOLS
// PUBLIC
// ======================================================

exports.searchSchools = async (req, res) => {
    try {
        const search =
            String(
                req.query.search || ""
            ).trim();

        if (search.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter at least 2 characters."
            });
        }

        const schools =
            await School.find({
                status: "Active",
                name: {
                    $regex: search,
                    $options: "i"
                }
            })
                .select(
                    "_id name email phone address school_type logo website"
                )
                .sort({
                    name: 1
                })
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
            message:
                "Failed to search schools.",
            error: error.message
        });
    }
};


// ======================================================
// GET PARENT DASHBOARD
// ======================================================

exports.getParentDashboard = async (
    req,
    res
) => {
    try {
        const {
            user,
            parent
        } =
            await getAuthenticatedParent(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        if (user.role !== "Parent") {
            return res.status(403).json({
                success: false,
                message:
                    "Only parent accounts can access this dashboard."
            });
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile is not linked to this account."
            });
        }

        const school =
            await School.findById(
                parent.school_id
            )
                .select(
                    "name email phone address school_type academic_session current_term motto logo website"
                )
                .lean();

        const children =
            await Student.find({
                school_id:
                    parent.school_id,
                parent_id:
                    parent._id
            })
                .select(
                    "admission_number first_name last_name other_name gender date_of_birth class_name arm admission_date passport status"
                )
                .sort({
                    created_at: -1
                })
                .lean();

        const summary = {
            totalChildren:
                children.length,

            activeChildren:
                children.filter(
                    child =>
                        child.status ===
                        "Active"
                ).length,

            pendingChildren:
                children.filter(
                    child =>
                        child.status ===
                        "Pending"
                ).length,

            suspendedChildren:
                children.filter(
                    child =>
                        child.status ===
                        "Suspended"
                ).length,

            graduatedChildren:
                children.filter(
                    child =>
                        child.status ===
                        "Graduated"
                ).length
        };

        const formattedChildren =
            children.map(child => ({
                id: child._id,

                fullName: [
                    child.first_name,
                    child.other_name,
                    child.last_name
                ]
                    .filter(Boolean)
                    .join(" "),

                admissionNumber:
                    child.admission_number,

                className:
                    child.class_name,

                arm:
                    child.arm,

                gender:
                    child.gender,

                dateOfBirth:
                    child.date_of_birth,

                admissionDate:
                    child.admission_date,

                passport:
                    child.passport,

                status:
                    child.status
            }));

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

                    email:
                        parent.email,

                    phone:
                        parent.phone,

                    alternatePhone:
                        parent.alternate_phone,

                    homeAddress:
                        parent.home_address,

                    occupation:
                        parent.occupation,

                    passport:
                        parent.passport,

                    status:
                        parent.status
                },

                school,

                summary,

                children:
                    formattedChildren
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


// ======================================================
// GET PARENT CHILDREN
// ======================================================

exports.getParentChildren = async (
    req,
    res
) => {
    try {
        const {
            user,
            parent
        } =
            await getAuthenticatedParent(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        const children =
            await Student.find({
                school_id:
                    parent.school_id,
                parent_id:
                    parent._id
            })
                .sort({
                    created_at: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            count: children.length,
            children
        });

    } catch (error) {
        console.error(
            "GET PARENT CHILDREN ERROR:",
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
// GET ONE CHILD
// ======================================================

exports.getParentChildById = async (
    req,
    res
) => {
    try {
        const {
            user,
            parent
        } =
            await getAuthenticatedParent(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        const child =
            await Student.findOne({
                _id: req.params.studentId,
                school_id:
                    parent.school_id,
                parent_id:
                    parent._id
            }).lean();

        if (!child) {
            return res.status(404).json({
                success: false,
                message:
                    "Child not found or is not linked to this parent."
            });
        }

        return res.status(200).json({
            success: true,
            child
        });

    } catch (error) {
        console.error(
            "GET PARENT CHILD ERROR:",
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


// ======================================================
// LINK EXISTING STUDENT TO PARENT
// PRINCIPAL / SCHOOL STAFF
// ======================================================

exports.linkStudentToParent = async (
    req,
    res
) => {
    try {
        const user =
            await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        if (!user.school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const {
            parent_id,
            student_id
        } = req.body;

        if (!parent_id || !student_id) {
            return res.status(400).json({
                success: false,
                message:
                    "parent_id and student_id are required."
            });
        }

        const parent =
            await Parent.findOne({
                _id: parent_id,
                school_id:
                    user.school_id
            });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found in your school."
            });
        }

        const student =
            await Student.findOne({
                _id: student_id,
                school_id:
                    user.school_id
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found in your school."
            });
        }

        student.parent_id =
            parent._id;

        await student.save();

        return res.status(200).json({
            success: true,
            message:
                "Student linked to parent successfully.",
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
// PRINCIPAL / SCHOOL STAFF
// ======================================================

exports.unlinkStudentFromParent = async (
    req,
    res
) => {
    try {
        const user =
            await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        const student =
            await Student.findOne({
                _id: req.params.studentId,
                school_id:
                    user.school_id
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }

        student.parent_id =
            null;

        await student.save();

        return res.status(200).json({
            success: true,
            message:
                "Student unlinked from parent successfully.",
            student
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
// EXPORTS
// ======================================================

module.exports = {
    registerParent:
        exports.registerParent,

    loginParent:
        exports.loginParent,

    getParentProfile:
        exports.getParentProfile,

    getParents:
        exports.getParents,

    getParentById:
        exports.getParentById,

    searchSchools:
        exports.searchSchools,

    getParentDashboard:
        exports.getParentDashboard,

    getParentChildren:
        exports.getParentChildren,

    getParentChildById:
        exports.getParentChildById,

    linkStudentToParent:
        exports.linkStudentToParent,

    unlinkStudentFromParent:
        exports.unlinkStudentFromParent
};
