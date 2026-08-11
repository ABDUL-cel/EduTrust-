const Parent = require("../models/Parent");
const User = require("../models/User");
const Student = require("../models/student");
const School = require("../models/school");

// ======================================================
// HELPER: GET LOGGED-IN USER ID
// ======================================================

const getUserId = (req) => {
    return req.user?.id || req.user?._id || null;
};

// ======================================================
// HELPER: GET SCHOOL ID
// ======================================================

const getSchoolId = async (req) => {
    const userId = getUserId(req);

    if (!userId) {
        return null;
    }

    const user = await User.findById(userId).lean();

    if (!user) {
        return null;
    }

    return user.school_id || null;
};


// ======================================================
// 1. REGISTER PARENT
// PUBLIC
// ======================================================

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
            school_id
        } = req.body;

        // ----------------------------------------------
        // REQUIRED FIELDS
        // ----------------------------------------------

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
        });

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Selected school was not found or is inactive."
            });
        }

        // ----------------------------------------------
        // CHECK DUPLICATE PHONE
        // ----------------------------------------------

        const existingParent = await Parent.findOne({
            school_id,
            phone: phone.trim()
        });

        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number already exists in this school."
            });
        }

        // ----------------------------------------------
        // CREATE PARENT
        // ----------------------------------------------

        const parent = await Parent.create({
            school_id,

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

            status: "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Parent registered successfully.",
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


// ======================================================
// 2. PARENT LOGIN
// PUBLIC
// ======================================================

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
                    "Phone number or email is required."
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
                email: email.trim().toLowerCase()
            });
        }

        const parent = await Parent.findOne({
            $or: conditions,
            status: "Active"
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent account not found."
            });
        }

        // ----------------------------------------------
        // FIND USER ACCOUNT
        // ----------------------------------------------

        const user = await User.findOne({
            parent_id: parent._id,
            role: "Parent"
        }).select("-password");

        return res.status(200).json({
            success: true,
            message: "Parent account found.",
            parent,
            user
        });

    } catch (error) {
        console.error(
            "PARENT LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Parent login failed.",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET LOGGED-IN PARENT PROFILE
// ======================================================

const getParentProfile = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        // ----------------------------------------------
        // FIND USER
        // ----------------------------------------------

        const user = await User.findById(
            userId
        )
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }

        if (user.role !== "Parent") {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not a parent account."
            });
        }

        if (!user.parent_id) {
            return res.status(404).json({
                success: false,
                message:
                    "This parent account is not linked to a parent profile."
            });
        }

        // ----------------------------------------------
        // FIND PARENT
        // ----------------------------------------------

        const parent = await Parent.findOne({
            _id: user.parent_id,
            school_id: user.school_id
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent,
            user
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
// 4. GET ALL PARENTS
// PRINCIPAL / SCHOOL STAFF
// ======================================================

const getParents = async (req, res) => {
    try {
        const schoolId =
            await getSchoolId(req);

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
// 5. GET ONE PARENT
// PRINCIPAL / SCHOOL STAFF
// ======================================================

const getParentById = async (req, res) => {
    try {
        const schoolId =
            await getSchoolId(req);

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


// ======================================================
// 6. PARENT DASHBOARD
// ======================================================

const getParentDashboard = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        // ----------------------------------------------
        // FIND LOGGED-IN USER
        // ----------------------------------------------

        const user = await User.findById(
            userId
        )
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }

        // ----------------------------------------------
        // CHECK ROLE
        // ----------------------------------------------

        if (user.role !== "Parent") {
            return res.status(403).json({
                success: false,
                message:
                    "Only parent accounts can access this dashboard."
            });
        }

        // ----------------------------------------------
        // CHECK PARENT LINK
        // ----------------------------------------------

        if (!user.parent_id) {
            return res.status(404).json({
                success: false,
                message:
                    "Your account is not linked to a parent profile."
            });
        }

        // ----------------------------------------------
        // FIND PARENT
        // ----------------------------------------------

        const parent =
            await Parent.findOne({
                _id: user.parent_id,
                school_id: user.school_id
            }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }

        // ----------------------------------------------
        // FIND CHILDREN
        // ----------------------------------------------

        const children =
            await Student.find({
                parent_id: parent._id,
                school_id: parent.school_id
            })
                .select(
                    "_id admission_number first_name last_name other_name gender class_name arm passport status admission_date"
                )
                .sort({
                    first_name: 1
                })
                .lean();

        // ----------------------------------------------
        // SCHOOL INFORMATION
        // ----------------------------------------------

        const school =
            await School.findById(
                parent.school_id
            )
                .select(
                    "_id name email phone address school_type academic_session current_term motto logo website"
                )
                .lean();

        // ----------------------------------------------
        // DASHBOARD RESPONSE
        // ----------------------------------------------

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

                school: school || null,

                children: children.map(
                    (child) => ({
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

                        gender:
                            child.gender,

                        className:
                            child.class_name,

                        arm:
                            child.arm,

                        passport:
                            child.passport,

                        status:
                            child.status,

                        admissionDate:
                            child.admission_date
                    })
                ),

                summary: {
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
                }
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
// 7. GET PARENT'S CHILDREN
// ======================================================

const getParentChildren = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        const user = await User.findById(
            userId
        ).lean();

        if (!user || user.role !== "Parent") {
            return res.status(403).json({
                success: false,
                message:
                    "Parent account required."
            });
        }

        if (!user.parent_id) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile is not linked."
            });
        }

        const children =
            await Student.find({
                parent_id: user.parent_id,
                school_id: user.school_id
            })
                .sort({
                    first_name: 1
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
// 8. GET ONE CHILD
// ======================================================

const getParentChild = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        const user =
            await User.findById(userId)
                .lean();

        if (
            !user ||
            user.role !== "Parent"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Parent account required."
            });
        }

        const child =
            await Student.findOne({
                _id: req.params.studentId,
                parent_id: user.parent_id,
                school_id: user.school_id
            }).lean();

        if (!child) {
            return res.status(404).json({
                success: false,
                message:
                    "Child not found."
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
// EXPORTS
// ======================================================

module.exports = {
    registerParent,
    loginParent,
    getParentProfile,
    getParents,
    getParentById,
    getParentDashboard,
    getParentChildren,
    getParentChild
};
