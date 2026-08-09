const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const School = require("../models/school");
const User = require("../models/user");

/* =========================================================
   HELPERS
========================================================= */

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function createToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            school_id: user.school_id
                ? user.school_id.toString()
                : null,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

function safeUser(user) {
    return {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        school_id: user.school_id
    };
}

/* =========================================================
   REGISTER USER / SCHOOL
========================================================= */

exports.registerUser = async (req, res) => {
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
            website,
            logo,
            principal_name,
            principal_email,
            password
        } = req.body;

        const normalizedSchoolEmail =
            normalizeEmail(school_email);

        const normalizedPrincipalEmail =
            normalizeEmail(principal_email);

        /* -------------------------
           Required fields
        ------------------------- */

        if (
            !school_name ||
            !normalizedSchoolEmail ||
            !principal_name ||
            !normalizedPrincipalEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required registration fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters."
            });
        }

        /* -------------------------
           Check duplicate school
        ------------------------- */

        const existingSchool =
            await School.findOne({
                email: normalizedSchoolEmail
            });

        if (existingSchool) {
            return res.status(409).json({
                success: false,
                message:
                    "A school with this email already exists."
            });
        }

        /* -------------------------
           Check duplicate user
        ------------------------- */

        const existingUser =
            await User.findOne({
                email: normalizedPrincipalEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }

        /* -------------------------
           Hash password
        ------------------------- */

        const hashedPassword =
            await bcrypt.hash(password, 10);

        /* -------------------------
           Create school
           MATCHES models/school.js
        ------------------------- */

        const school =
            await School.create({
                name: school_name,
                email: normalizedSchoolEmail,
                phone: phone || "",
                address: address || "",
                school_type: school_type || "",
                academic_session:
                    academic_session || "",
                current_term:
                    current_term || "",
                motto:
                    school_motto || "",
                website:
                    website || "",
                logo:
                    logo || "",
                status: "Active"
            });

        /* -------------------------
           Create principal account
        ------------------------- */

        let user;

        try {
            user = await User.create({
                school_id: school._id,
                full_name: principal_name.trim(),
                email: normalizedPrincipalEmail,
                phone: phone || "",
                password: hashedPassword,
                role: "Principal"
            });

            /* -------------------------
               Link principal to school
            ------------------------- */

            school.principal_id = user._id;

            await school.save();

        } catch (userError) {

            /*
             * If user creation fails after school creation,
             * remove the school so we don't leave orphan data.
             */

            await School.findByIdAndDelete(
                school._id
            );

            throw userError;
        }

        /* -------------------------
           Return success
        ------------------------- */

        return res.status(201).json({
            success: true,
            message:
                "School account created successfully.",
            school: {
                id: school._id,
                name: school.name,
                email: school.email,
                phone: school.phone,
                address: school.address,
                school_type:
                    school.school_type,
                academic_session:
                    school.academic_session,
                current_term:
                    school.current_term,
                motto: school.motto,
                website: school.website,
                logo: school.logo,
                principal_id:
                    school.principal_id,
                status: school.status
            },
            user: safeUser(user)
        });

    } catch (error) {

        console.error(
            "REGISTER USER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Registration failed."
        });
    }
};

/* =========================================================
   LOGIN USER
========================================================= */

exports.loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const normalizedEmail =
            normalizeEmail(email);

        if (
            !normalizedEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });
        }

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        if (!user.school_id) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not connected to a school."
            });
        }

        const school =
            await School.findById(
                user.school_id
            );

        if (!school) {
            return res.status(404).json({
                success: false,
                message:
                    "School account could not be found."
            });
        }

        if (school.status !== "Active") {
            return res.status(403).json({
                success: false,
                message:
                    "This school account is not active."
            });
        }

        const token =
            createToken(user);

        return res.status(200).json({
            success: true,
            message:
                "Login successful.",
            token,
            user: {
                ...safeUser(user),
                school_name:
                    school.name,
                school_email:
                    school.email,
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
                    school.logo
            }
        });

    } catch (error) {

        console.error(
            "LOGIN USER ERROR:",
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

/* =========================================================
   GET LOGGED-IN USER
========================================================= */

exports.getMe = async (req, res) => {
    try {
        const userId =
            req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication session."
            });
        }

        const user =
            await User.findById(
                userId
            ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }

        let school = null;

        if (user.school_id) {
            school =
                await School.findById(
                    user.school_id
                );
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                full_name:
                    user.full_name,
                email:
                    user.email,
                phone:
                    user.phone || "",
                role:
                    user.role,
                school_id:
                    user.school_id,

                school_name:
                    school?.name || "",
                school_email:
                    school?.email || "",
                address:
                    school?.address || "",
                school_type:
                    school?.school_type || "",
                academic_session:
                    school?.academic_session || "",
                current_term:
                    school?.current_term || "",
                motto:
                    school?.motto || "",
                website:
                    school?.website || "",
                logo:
                    school?.logo || "",
                school_status:
                    school?.status || ""
            }
        });

    } catch (error) {

        console.error(
            "GET ME ERROR:",
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
