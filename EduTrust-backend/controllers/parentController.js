const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");
const School = require("../models/school");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "edutrust_fallback_secret_key";

// ============================================================
// REGISTER PARENT
// ============================================================

exports.registerParent = async (
    req,
    res
) => {
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
            school_id,
            password
        } = req.body;

        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !relationship?.trim() ||
            !phone?.trim() ||
            !school_id ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship, phone, school, and password are required."
            });
        }

        if (
            String(password).length < 6
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters."
            });
        }

        // ==================================================
        // SCHOOL
        // ==================================================

        const school =
            await School.findOne({
                _id: school_id,
                status: "Active"
            });

        if (!school) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected school was not found or is not active."
            });
        }

        // ==================================================
        // NORMALIZE
        // ==================================================

        const cleanFirstName =
            first_name.trim();

        const cleanLastName =
            last_name.trim();

        const cleanOtherName =
            other_name?.trim() || "";

        const cleanRelationship =
            relationship.trim();

        const cleanPhone =
            phone.trim();

        const cleanEmail =
            email?.trim().toLowerCase() || "";

        // ==================================================
        // DUPLICATE PARENT
        // ==================================================

        const duplicateParentConditions = [
            {
                school_id,
                phone: cleanPhone
            }
        ];

        if (cleanEmail) {
            duplicateParentConditions.push({
                school_id,
                email: cleanEmail
            });
        }

        const existingParent =
            await Parent.findOne({
                $or:
                    duplicateParentConditions
            });

        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number or email already exists in this school."
            });
        }

        // ==================================================
        // DUPLICATE USER
        // ==================================================

        if (cleanEmail) {

            const existingUser =
                await User.findOne({
                    email:
                        cleanEmail
                });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists."
                });
            }
        }

        // ==================================================
        // CREATE PARENT
        // ==================================================

        const parent =
            await Parent.create({
                school_id,

                first_name:
                    cleanFirstName,

                last_name:
                    cleanLastName,

                other_name:
                    cleanOtherName,

                relationship:
                    cleanRelationship,

                email:
                    cleanEmail,

                phone:
                    cleanPhone,

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

        // ==================================================
        // CREATE USER ACCOUNT
        // ==================================================

        try {

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const fullName = [
                cleanFirstName,
                cleanOtherName,
                cleanLastName
            ]
                .filter(Boolean)
                .join(" ");

            await User.create({
                first_name:
                    cleanFirstName,

                last_name:
                    cleanLastName,

                other_name:
                    cleanOtherName,

                full_name:
                    fullName,

                email:
                    cleanEmail,

                phone:
                    cleanPhone,

                password:
                    hashedPassword,

                role:
                    "Parent",

                status:
                    "Active",

                school_id,

                parent_id:
                    parent._id
            });

        } catch (userError) {

            // Roll back Parent
            await Parent.findByIdAndDelete(
                parent._id
            );

            throw userError;
        }

        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(201).json({
            success: true,
            message:
                "Parent account created successfully.",
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
                error.message ||
                "Failed to register parent."
        });
    }
};

// ============================================================
// SEARCH SCHOOLS
// ============================================================

exports.searchSchools = async (
    req,
    res
) => {
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
                    $regex:
                        search,
                    $options:
                        "i"
                }
            })
                .select(
                    "_id name email address school_type logo website school_code"
                )
                .sort({
                    name: 1
                })
                .limit(20)
                .lean();

        return res.status(200).json({
            success: true,
            count:
                schools.length,
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
                "Failed to search schools."
        });
    }
};

// ============================================================
// PARENT LOGIN CONTROLLER
// ============================================================
exports.loginParent = async (req, res) => {
    try {
        const { phone, email, emailOrPhone, identity, password } = req.body;

        // Extract input from any field format sent by frontend
        const targetIdentity = (emailOrPhone || identity || email || phone || "").trim();

        if (!targetIdentity) {
            return res.status(400).json({
                success: false,
                message: "Email or phone number is required."
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required."
            });
        }

        const normalizedInput = targetIdentity.toLowerCase();

        // 1. Check Parent Collection first
        let parentUser = null;
        if (typeof Parent !== "undefined") {
            parentUser = await Parent.findOne({
                $or: [
                    { email: normalizedInput },
                    { phone: targetIdentity }
                ]
            });
        }

        // 2. If not found in Parent model, fallback to User collection where role is 'Parent'
        if (!parentUser && typeof User !== "undefined") {
            parentUser = await User.findOne({
                $and: [
                    {
                        $or: [
                            { email: normalizedInput },
                            { phone: targetIdentity }
                        ]
                    },
                    { role: { $regex: /^parent$/i } }
                ]
            });
        }

        // 3. Handle missing parent account
        if (!parentUser) {
            return res.status(404).json({
                success: false,
                message: "No active Parent account found with these credentials. If you are a staff member, please use the staff portal."
            });
        }

        // 4. Verify Password
        const isMatch = await bcrypt.compare(password, parentUser.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials."
            });
        }

        // 5. Generate Auth Token
        const token = jwt.sign(
            { 
                id: parentUser._id, 
                role: parentUser.role || "Parent", 
                school_id: parentUser.school_id 
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6. Return Success Response
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token: token,
            parent: {
                id: parentUser._id,
                full_name: parentUser.full_name || `${parentUser.first_name || ""} ${parentUser.last_name || ""}`.trim(),
                email: parentUser.email,
                phone: parentUser.phone,
                role: parentUser.role || "Parent"
            }
        });

    } catch (error) {
        console.error("PARENT LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred during parent login."
        });
    }
};
        // ==================================================
        // FIND PARENT
        // ==================================================

        const parent =
            await Parent.findOne({
                $or:
                    conditions,
                status:
                    "Active"
            }).lean();

        if (!parent) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid login credentials."
            });
        }

        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findOne({
                parent_id:
                    parent._id,

                role:
                    "Parent",

                school_id:
                    parent.school_id
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Parent login account was not found."
            });
        }

        // Inside your Parent Login Controller
if (user.role !== "parent") {
    return res.status(403).json({
        success: false,
        message: "Access denied. School staff must log in via the main portal."
    });
}
        // ==================================================
        // STATUS
        // ==================================================

        if (
            user.status !== "Active"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This parent account is not active."
            });
        }

        // ==================================================
        // PASSWORD
        // ==================================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid login credentials."
            });
        }

        // ==================================================
        // SCHOOL
        // ==================================================

        const school =
            await School.findById(
                parent.school_id
            ).lean();

        if (!school) {
            return res.status(404).json({
                success: false,
                message:
                    "School account was not found."
            });
        }

        if (
            school.status !== "Active"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This school is not active."
            });
        }

        // ==================================================
        // JWT
        // ==================================================

        const token =
            jwt.sign(
                {
                    id:
                        user._id,

                    school_id:
                        user.school_id,

                    parent_id:
                        user.parent_id,

                    role:
                        user.role
                },
                JWT_SECRET,
                {
                    expiresIn:
                        "7d"
                }
            );

        // ==================================================
        // SUCCESS
        // ==================================================

        const fullName = [
            parent.first_name,
            parent.other_name,
            parent.last_name
        ]
            .filter(Boolean)
            .join(" ");

        return res.status(200).json({
            success: true,

            message:
                "Parent login successful.",

            token,

            user: {
                id:
                    user._id,

                full_name:
                    fullName,

                email:
                    parent.email,

                phone:
                    parent.phone,

                role:
                    user.role,

                school_id:
                    user.school_id,

                parent_id:
                    user.parent_id
            },

            school: {
                id:
                    school._id,

                name:
                    school.name,

                school_code:
                    school.school_code,

                logo:
                    school.logo
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
                "Parent login failed."
        });
    }
};

// ============================================================
// GET PARENT PROFILE
// ============================================================

exports.getParentProfile = async (
    req,
    res
) => {
    try {

        const parentId =
            req.user?.parent_id;

        if (!parentId) {
            return res.status(403).json({
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
                "Failed to load parent profile."
        });
    }
};

// ============================================================
// UPDATE PARENT PROFILE
// ============================================================

exports.updateParentProfile = async (
    req,
    res
) => {
    try {

        const parentId =
            req.user?.parent_id;

        if (!parentId) {
            return res.status(403).json({
                success: false,
                message:
                    "Parent profile reference not found."
            });
        }

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
            passport
        } = req.body;

        const updateFields = {};

        if (
            first_name !== undefined
        ) {
            updateFields.first_name =
                first_name.trim();
        }

        if (
            last_name !== undefined
        ) {
            updateFields.last_name =
                last_name.trim();
        }

        if (
            other_name !== undefined
        ) {
            updateFields.other_name =
                other_name.trim();
        }

        if (
            relationship !== undefined
        ) {
            updateFields.relationship =
                relationship.trim();
        }

        if (
            email !== undefined
        ) {
            updateFields.email =
                email.trim().toLowerCase();
        }

        if (
            phone !== undefined
        ) {
            updateFields.phone =
                phone.trim();
        }

        if (
            alternate_phone !== undefined
        ) {
            updateFields.alternate_phone =
                alternate_phone.trim();
        }

        if (
            home_address !== undefined
        ) {
            updateFields.home_address =
                home_address.trim();
        }

        if (
            occupation !== undefined
        ) {
            updateFields.occupation =
                occupation.trim();
        }

        if (
            passport !== undefined
        ) {
            updateFields.passport =
                passport;
        }

        const updatedParent =
            await Parent.findByIdAndUpdate(
                parentId,
                {
                    $set:
                        updateFields
                },
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

        if (!updatedParent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent record not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Parent profile updated successfully.",
            parent:
                updatedParent
        });

    } catch (error) {

        console.error(
            "UPDATE PARENT PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update parent profile."
        });
    }
};

// ============================================================
// GET ALL PARENTS FOR CURRENT SCHOOL
// ============================================================

exports.getParents = async (
    req,
    res
) => {
    try {

        const schoolId =
            req.user?.school_id;

        if (!schoolId) {
            return res.status(403).json({
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

        // ==================================================
        // GET STUDENT COUNTS
        // ==================================================

        const parentIds =
            parents.map(
                parent =>
                    parent._id
            );

        const studentCounts =
            await Student.aggregate([
                {
                    $match: {
                        school_id:
                            schoolId,

                        parent_id: {
                            $in:
                                parentIds
                        }
                    }
                },

                {
                    $group: {
                        _id:
                            "$parent_id",

                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);

        const countMap =
            new Map(
                studentCounts.map(
                    item => [
                        String(item._id),
                        item.count
                    ]
                )
            );

        const formattedParents =
            parents.map(
                parent => ({
                    ...parent,

                    student_count:
                        countMap.get(
                            String(parent._id)
                        ) || 0
                })
            );

        return res.status(200).json({
            success: true,
            count:
                formattedParents.length,
            parents:
                formattedParents
        });

    } catch (error) {

        console.error(
            "GET PARENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parents."
        });
    }
};

// ============================================================
// GET ONE PARENT
// ============================================================

exports.getParentById = async (
    req,
    res
) => {
    try {

        const schoolId =
            req.user?.school_id;

        const parentId =
            req.params.id;

        if (!schoolId) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const parent =
            await Parent.findOne({
                _id:
                    parentId,

                school_id:
                    schoolId
            }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found."
            });
        }

        const students =
            await Student.find({
                parent_id:
                    parent._id,

                school_id:
                    schoolId
            })
                .sort({
                    created_at: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            parent,
            students
        });

    } catch (error) {

        console.error(
            "GET PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent."
        });
    }
};

// ============================================================
// UPDATE PARENT BY ID
// ============================================================

exports.updateParentById = async (
    req,
    res
) => {
    try {

        const schoolId =
            req.user?.school_id;

        if (!schoolId) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }

        const allowedFields = [
            "first_name",
            "last_name",
            "other_name",
            "relationship",
            "email",
            "phone",
            "alternate_phone",
            "home_address",
            "occupation",
            "passport",
            "status"
        ];

        const updateFields = {};

        for (
            const field
            of allowedFields
        ) {
            if (
                req.body[field] !==
                undefined
            ) {
                updateFields[field] =
                    typeof req.body[field] ===
                    "string"
                        ? req.body[field].trim()
                        : req.body[field];
            }
        }

        if (
            updateFields.email !==
            undefined
        ) {
            updateFields.email =
                updateFields.email
                    .toLowerCase();
        }

        const updatedParent =
            await Parent.findOneAndUpdate(
                {
                    _id:
                        req.params.id,

                    school_id:
                        schoolId
                },
                {
                    $set:
                        updateFields
                },
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

        if (!updatedParent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found or unauthorized to update."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Parent details updated successfully.",
            parent:
                updatedParent
        });

    } catch (error) {

        console.error(
            "UPDATE PARENT BY ID ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update parent details."
        });
    }
};

// ============================================================
// PARENT DASHBOARD
// ============================================================

exports.getParentDashboard = async (
    req,
    res
) => {
    try {

        const parentId =
            req.user?.parent_id;

        if (!parentId) {
            return res.status(403).json({
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

        const school =
            await School.findById(
                parent.school_id
            ).lean();

        const children =
            await Student.find({
                parent_id:
                    parent._id,

                school_id:
                    parent.school_id
            })
                .sort({
                    created_at: -1
                })
                .lean();

        const formattedChildren =
            children.map(
                child => ({
                    id:
                        child._id,

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

                    status:
                        child.status,

                    passport:
                        child.passport
                })
            );

        const activeChildren =
            children.filter(
                child =>
                    child.status ===
                    "Active"
            ).length;

        const pendingChildren =
            children.filter(
                child =>
                    child.status ===
                    "Pending"
            ).length;

        const suspendedChildren =
            children.filter(
                child =>
                    child.status ===
                    "Suspended"
            ).length;

        const fullName = [
            parent.first_name,
            parent.other_name,
            parent.last_name
        ]
            .filter(Boolean)
            .join(" ");

        return res.status(200).json({
            success: true,

            dashboard: {

                parent: {
                    id:
                        parent._id,

                    fullName,

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

                    schoolId:
                        parent.school_id,

                    status:
                        parent.status
                },

                school: school
                    ? {
                        id:
                            school._id,

                        name:
                            school.name,

                        schoolCode:
                            school.school_code,

                        logo:
                            school.logo,

                        academicSession:
                            school.academic_session,

                        currentTerm:
                            school.current_term
                    }
                    : null,

                statistics: {
                    totalChildren:
                        children.length,

                    activeChildren,

                    pendingChildren,

                    suspendedChildren
                },

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
                "Failed to load parent dashboard."
        });
    }
};
