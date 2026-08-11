const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "edutrust_fallback_secret_key";


// ============================================================================
// HELPER: GET AUTHENTICATED USER ID
// ============================================================================

const getUserId = (req) => {
    return req.user?.id || req.user?._id;
};


// ============================================================================
// HELPER: GET PARENT ID FROM AUTHENTICATED USER
// ============================================================================

const getParentId = async (req) => {
    const userId = getUserId(req);

    if (!userId) {
        return null;
    }

    // First try the parent_id already attached to the token/user
    if (req.user?.parent_id) {
        return req.user.parent_id;
    }

    // Fallback: reload User from database
    const user = await User.findById(userId).select(
        "parent_id role school_id"
    );

    return user?.parent_id || null;
};


// ============================================================================
// 1. REGISTER PARENT
// ============================================================================

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
            password,
            school_id
        } = req.body;


        // --------------------------------------------------------------------
        // DETERMINE SCHOOL
        // --------------------------------------------------------------------

        let targetSchoolId = school_id;

        if (!targetSchoolId && req.user) {
            targetSchoolId =
                req.user.school_id || null;
        }


        if (!targetSchoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "School ID is required to register a parent."
            });
        }


        // --------------------------------------------------------------------
        // REQUIRED FIELDS
        // --------------------------------------------------------------------

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


        // --------------------------------------------------------------------
        // PASSWORD
        // --------------------------------------------------------------------

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters."
            });
        }


        // --------------------------------------------------------------------
        // CHECK DUPLICATE PARENT
        // --------------------------------------------------------------------

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


        // --------------------------------------------------------------------
        // CHECK DUPLICATE USER
        // --------------------------------------------------------------------

        const normalizedEmail =
            email?.trim().toLowerCase() || "";


        if (normalizedEmail) {

            const existingUser =
                await User.findOne({
                    email: normalizedEmail
                });


            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists."
                });
            }
        }


        // --------------------------------------------------------------------
        // CREATE PARENT
        // --------------------------------------------------------------------

        const parent =
            await Parent.create({

                school_id:
                    targetSchoolId,

                first_name:
                    first_name.trim(),

                last_name:
                    last_name.trim(),

                other_name:
                    other_name?.trim() || "",

                relationship:
                    relationship.trim(),

                email:
                    normalizedEmail,

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
                    "Active"
            });


        // --------------------------------------------------------------------
        // HASH PASSWORD
        // --------------------------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 12);


        // --------------------------------------------------------------------
        // CREATE USER ACCOUNT
        // --------------------------------------------------------------------

        const user =
            await User.create({

                first_name:
                    first_name.trim(),

                last_name:
                    last_name.trim(),

                other_name:
                    other_name?.trim() || "",

                full_name:
                    [
                        first_name,
                        other_name,
                        last_name
                    ]
                        .filter(Boolean)
                        .join(" "),

                email:
                    normalizedEmail,

                phone:
                    phone.trim(),

                password:
                    hashedPassword,

                role:
                    "Parent",

                status:
                    "Active",

                school_id:
                    targetSchoolId,

                parent_id:
                    parent._id
            });


        return res.status(201).json({

            success: true,

            message:
                "Parent account created successfully.",

            parent: {
                _id: parent._id,
                first_name: parent.first_name,
                last_name: parent.last_name,
                email: parent.email,
                phone: parent.phone,
                relationship: parent.relationship
            },

            user: {
                _id: user._id,
                role: user.role,
                parent_id: user.parent_id
            }
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

            error:
                error.message
        });
    }
};


// ============================================================================
// 2. PARENT LOGIN
// ============================================================================

const loginParent = async (req, res) => {

    try {

        const {
            email,
            phone,
            password
        } = req.body;


        if (!password) {
            return res.status(400).json({
                success: false,
                message:
                    "Password is required."
            });
        }


        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message:
                    "Email or phone number is required."
            });
        }


        // --------------------------------------------------------------------
        // FIND USER
        // --------------------------------------------------------------------

        let user;


        if (email) {

            user =
                await User.findOne({
                    email:
                        email.trim().toLowerCase(),
                    role: "Parent"
                });

        } else {

            user =
                await User.findOne({
                    phone:
                        phone.trim(),
                    role: "Parent"
                });
        }


        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid parent login details."
            });
        }


        // --------------------------------------------------------------------
        // CHECK STATUS
        // --------------------------------------------------------------------

        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message:
                    "This parent account is not active."
            });
        }


        // --------------------------------------------------------------------
        // CHECK PASSWORD
        // --------------------------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid parent login details."
            });
        }


        // --------------------------------------------------------------------
        // CREATE TOKEN
        // --------------------------------------------------------------------

        const token =
            jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                    school_id: user.school_id,
                    parent_id: user.parent_id
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


        return res.status(200).json({

            success: true,

            message:
                "Parent login successful.",

            token,

            user: {

                id:
                    user._id,

                first_name:
                    user.first_name,

                last_name:
                    user.last_name,

                full_name:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                school_id:
                    user.school_id,

                parent_id:
                    user.parent_id
            }
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

            error:
                error.message
        });
    }
};


// ============================================================================
// 3. GET PARENT PROFILE
// ============================================================================

const getParentProfile = async (req, res) => {

    try {

        const parentId =
            await getParentId(req);


        if (!parentId) {
            return res.status(404).json({

                success: false,

                message:
                    "Parent account is not linked to a parent profile."
            });
        }


        const parent =
            await Parent.findById(
                parentId
            )
                .populate(
                    "school_id",
                    "name email phone address logo website"
                )
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

            error:
                error.message
        });
    }
};


// ============================================================================
// 4. GET ALL PARENTS
// PRINCIPAL / SCHOOL ADMIN
// ============================================================================

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
                school_id:
                    schoolId
            })
                .sort({
                    created_at: -1
                })
                .lean();


        return res.status(200).json({

            success: true,

            count:
                parents.length,

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

            error:
                error.message
        });
    }
};


// ============================================================================
// 5. GET ONE PARENT
// ============================================================================

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

                _id:
                    req.params.id,

                school_id:
                    schoolId

            })
                .lean();


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

            error:
                error.message
        });
    }
};


// ============================================================================
// 6. GET PARENT CHILDREN
// ============================================================================

const getParentChildren = async (req, res) => {

    try {

        const parentId =
            await getParentId(req);


        if (!parentId) {
            return res.status(404).json({

                success: false,

                message:
                    "Parent account is not linked to a parent profile."
            });
        }


        const children =
            await Student.find({

                parent_id:
                    parentId,

                status: {
                    $ne: "Archived"
                }

            })
                .select(
                    [
                        "_id",
                        "school_id",
                        "parent_id",
                        "admission_number",
                        "first_name",
                        "last_name",
                        "other_name",
                        "gender",
                        "date_of_birth",
                        "class_name",
                        "arm",
                        "admission_date",
                        "passport",
                        "status"
                    ].join(" ")
                )
                .sort({
                    first_name: 1
                })
                .lean();


        return res.status(200).json({

            success: true,

            count:
                children.length,

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

            error:
                error.message
        });
    }
};


// ============================================================================
// 7. GET ONE CHILD FOR PARENT
// ============================================================================

const getParentChild = async (req, res) => {

    try {

        const parentId =
            await getParentId(req);


        if (!parentId) {
            return res.status(404).json({

                success: false,

                message:
                    "Parent account is not linked to a parent profile."
            });
        }


        const student =
            await Student.findOne({

                _id:
                    req.params.studentId,

                parent_id:
                    parentId

            })
                .populate(
                    "school_id",
                    "name email phone address logo website academic_session current_term"
                )
                .lean();


        if (!student) {
            return res.status(404).json({

                success: false,

                message:
                    "Student not found or this student is not linked to your parent account."
            });
        }


        return res.status(200).json({

            success: true,

            student
        });


    } catch (error) {

        console.error(
            "GET PARENT CHILD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load student.",

            error:
                error.message
        });
    }
};


// ============================================================================
// 8. PARENT DASHBOARD
// ============================================================================

const getParentDashboard =
    async (req, res) => {

        try {

            const parentId =
                await getParentId(req);


            if (!parentId) {
                return res.status(404).json({

                    success: false,

                    message:
                        "Parent account is not linked to a parent profile."
                });
            }


            // ---------------------------------------------------------------
            // GET PARENT
            // ---------------------------------------------------------------

            const parent =
                await Parent.findById(
                    parentId
                )
                    .populate(
                        "school_id",
                        "name email phone address logo website academic_session current_term"
                    )
                    .lean();


            if (!parent) {
                return res.status(404).json({

                    success: false,

                    message:
                        "Parent profile not found."
                });
            }


            // ---------------------------------------------------------------
            // GET CHILDREN
            // ---------------------------------------------------------------

            const children =
                await Student.find({

                    parent_id:
                        parentId,

                    status: {
                        $ne: "Archived"
                    }

                })
                    .select(
                        [
                            "_id",
                            "school_id",
                            "parent_id",
                            "admission_number",
                            "first_name",
                            "last_name",
                            "other_name",
                            "gender",
                            "date_of_birth",
                            "class_name",
                            "arm",
                            "admission_date",
                            "passport",
                            "status"
                        ].join(" ")
                    )
                    .sort({
                        first_name: 1
                    })
                    .lean();


            // ---------------------------------------------------------------
            // DASHBOARD RESPONSE
            // ---------------------------------------------------------------

            return res.status(200).json({

                success: true,

                dashboard: {

                    parent: {

                        id:
                            parent._id,

                        fullName: [
                            parent.first_name,
                            parent.other_name,
                            parent.last_name
                        ]
                            .filter(Boolean)
                            .join(" "),

                        firstName:
                            parent.first_name,

                        lastName:
                            parent.last_name,

                        otherName:
                            parent.other_name,

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


                    school:
                        parent.school_id || null,


                    children: {

                        count:
                            children.length,

                        students:
                            children
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

                error:
                    error.message
            });
        }
    };


// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {

    registerParent,

    loginParent,

    getParentProfile,

    getParents,

    getParentById,

    getParentChildren,

    getParentChild,

    getParentDashboard
};
