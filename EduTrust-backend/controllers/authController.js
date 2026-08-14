const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const School = require("../models/school");
const User = require("../models/User");

const JWT_SECRET =
    process.env.JWT_SECRET || "edutrust_fallback_secret_key";

// ======================================================
// GENERATE SCHOOL CODE
// ======================================================

function generateSchoolCode(schoolName) {
    const prefix = String(schoolName || "SCHOOL")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 5)
        .toUpperCase()
        .padEnd(3, "X");

    const randomNumber =
        Math.floor(10000 + Math.random() * 90000);

    return `${prefix}${randomNumber}`;
}

// ======================================================
// CREATE UNIQUE SCHOOL CODE
// ======================================================

async function createUniqueSchoolCode(schoolName) {
    let schoolCode;

    let exists = true;

    while (exists) {
        schoolCode = generateSchoolCode(schoolName);

        exists = await School.exists({
            school_code: schoolCode
        });
    }

    return schoolCode;
}

// ======================================================
// REGISTER SCHOOL + PRINCIPAL
// ======================================================

exports.registerSchool = async (req, res) => {
    try {
        const {
            school_name,
            school_email,
            phone,
            address,
            school_type,
            academic_session,
            current_term,
            school_motto,
            motto,
            website,
            logo,
            principal_name,
            principal_email,
            password
        } = req.body;

        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !school_name ||
            !school_email ||
            !principal_name ||
            !principal_email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "School name, school email, principal name, principal email and password are required."
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters."
            });
        }

        // ==================================================
        // NORMALIZE
        // ==================================================

        const schoolName =
            String(school_name).trim();

        const schoolEmail =
            String(school_email)
                .trim()
                .toLowerCase();

        const principalName =
            String(principal_name).trim();

        const principalEmail =
            String(principal_email)
                .trim()
                .toLowerCase();

        // ==================================================
        // DUPLICATE SCHOOL
        // ==================================================

        const existingSchool =
            await School.findOne({
                email: schoolEmail
            });

        if (existingSchool) {
            return res.status(409).json({
                success: false,
                message:
                    "A school with this email already exists."
            });
        }

        // ==================================================
        // DUPLICATE USER
        // ==================================================

        const existingUser =
            await User.findOne({
                email: principalEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }

        // ==================================================
        // SCHOOL CODE
        // ==================================================

        const schoolCode =
            await createUniqueSchoolCode(
                schoolName
            );

        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // ==================================================
        // CREATE SCHOOL
        // ==================================================

        const school =
            await School.create({
                name: schoolName,
                email: schoolEmail,
                phone: phone || "",
                address: address || "",
                school_type:
                    school_type || "",
                academic_session:
                    academic_session || "",
                current_term:
                    current_term || "",
                motto:
                    school_motto ||
                    motto ||
                    "",
                website:
                    website || "",
                logo:
                    logo || "",
                school_code:
                    schoolCode,
                status: "Active"
            });

        // ==================================================
        // CREATE PRINCIPAL USER
        // ==================================================

        let user;

        try {
            user =
                await User.create({
                    first_name:
                        principalName
                            .split(" ")[0] || "",

                    last_name:
                        principalName
                            .split(" ")
                            .slice(1)
                            .join(" ") || "",

                    full_name:
                        principalName,

                    email:
                        principalEmail,

                    phone:
                        phone || "",

                    password:
                        hashedPassword,

                    role:
                        "Principal",

                    status:
                        "Active",

                    school_id:
                        school._id
                });

        } catch (userError) {

            await School.findByIdAndDelete(
                school._id
            );

            throw userError;
        }

        // ==================================================
        // LINK PRINCIPAL TO SCHOOL
        // ==================================================

        school.principal_id =
            user._id;

        await school.save();

        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(201).json({
            success: true,

            message:
                "School registered successfully.",

            school: {
                id:
                    school._id,

                name:
                    school.name,

                email:
                    school.email,

                school_code:
                    school.school_code,

                phone:
                    school.phone,

                address:
                    school.address,

                school_type:
                    school.school_type,

                academic_session:
                    school.academic_session,

                current_term:
                    school.current_term,

                motto:
                    school.motto,

                website:
                    school.website,

                logo:
                    school.logo,

                principal_id:
                    school.principal_id,

                status:
                    school.status
            },

            user: {
                id:
                    user._id,

                full_name:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                school_id:
                    user.school_id
            }
        });

    } catch (error) {

        console.error(
            "REGISTER SCHOOL ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "School registration failed."
        });
    }
};

// ======================================================
// PRINCIPAL / SCHOOL LOGIN
// ======================================================

exports.login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findOne({
                email:
                    normalizedEmail
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        // ==================================================
        // ACCOUNT STATUS
        // ==================================================

        if (
            user.status !== "Active"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not active."
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
                    "Invalid email or password."
            });
        }

        // ==================================================
        // LOAD SCHOOL
        // ==================================================

        let school = null;

        if (user.school_id) {
            school =
                await School.findById(
                    user.school_id
                ).lean();
        }

        if (
            user.role !== "SuperAdmin" &&
            !school
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not connected to a valid school."
            });
        }

        if (
            school &&
            school.status !== "Active"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This school account is not active."
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

                    role:
                        user.role,

                    parent_id:
                        user.parent_id,

                    student_id:
                        user.student_id,

                    teacher_id:
                        user.teacher_id,

                    staff_id:
                        user.staff_id
                },
                JWT_SECRET,
                {
                    expiresIn:
                        "7d"
                }
            );

        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            success: true,

            message:
                "Login successful.",

            token,

            user: {
                id:
                    user._id,

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
                    user.parent_id,

                student_id:
                    user.student_id,

                teacher_id:
                    user.teacher_id,

                staff_id:
                    user.staff_id
            },

            school: school
                ? {
                    id:
                        school._id,

                    name:
                        school.name,

                    email:
                        school.email,

                    school_code:
                        school.school_code,

                    phone:
                        school.phone,

                    address:
                        school.address,

                    school_type:
                        school.school_type,

                    academic_session:
                        school.academic_session,

                    current_term:
                        school.current_term,

                    motto:
                        school.motto,

                    website:
                        school.website,

                    logo:
                        school.logo,

                    status:
                        school.status
                }
                : null
        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Login failed."
        });
    }
};

// ======================================================
// GET LOGGED-IN USER PROFILE
// ======================================================

exports.getProfile = async (
    req,
    res
) => {
    try {
        const user =
            await User.findById(
                req.user._id
            )
                .select("-password")
                .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        let school = null;

        if (user.school_id) {
            school =
                await School.findById(
                    user.school_id
                ).lean();
        }

        return res.status(200).json({
            success: true,
            user,
            school
        });

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load profile."
        });
    }
};
