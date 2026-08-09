const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const School = require("../models/school");
const User = require("../models/user");

// =========================================================
// REGISTER SCHOOL + PRINCIPAL
// =========================================================

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
            website,
            logo,
            principal_name,
            principal_email,
            password
        } = req.body;

        // -------------------------------------------------
        // Required fields
        // -------------------------------------------------

        const requiredFields = {
            school_name,
            school_email,
            phone,
            address,
            school_type,
            academic_session,
            current_term,
            principal_name,
            principal_email,
            password
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => {
                return (
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ""
                );
            })
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
                missingFields
            });
        }

        // -------------------------------------------------
        // Normalize email
        // -------------------------------------------------

        const normalizedSchoolEmail =
            school_email.trim().toLowerCase();

        const normalizedPrincipalEmail =
            principal_email.trim().toLowerCase();

        // -------------------------------------------------
        // Check existing school
        // -------------------------------------------------

        const existingSchool = await School.findOne({
            email: normalizedSchoolEmail
        });

        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "School email already exists."
            });
        }

        // -------------------------------------------------
        // Check existing principal
        // -------------------------------------------------

        const existingUser = await User.findOne({
            email: normalizedPrincipalEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Principal email already exists."
            });
        }

        // -------------------------------------------------
        // Hash password
        // -------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // -------------------------------------------------
        // Create School
        // -------------------------------------------------

        const school = await School.create({

            name: school_name.trim(),

            email: normalizedSchoolEmail,

            phone: phone.trim(),

            address: address.trim(),

            school_type:
                school_type.trim(),

            academic_session:
                academic_session.trim(),

            current_term:
                current_term.trim(),

            motto:
                school_motto
                    ? school_motto.trim()
                    : "",

            website:
                website
                    ? website.trim()
                    : "",

            logo:
                logo
                    ? logo
                    : "",

            status: "Active"
        });

        // -------------------------------------------------
        // Create Principal
        // -------------------------------------------------

        const user = await User.create({

            school_id: school._id,

            full_name:
                principal_name.trim(),

            email:
                normalizedPrincipalEmail,

            phone:
                phone.trim(),

            password:
                hashedPassword,

            role: "Principal"
        });

        // -------------------------------------------------
        // Link principal to school
        // -------------------------------------------------

        school.principal_id = user._id;

        await school.save();

        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "School registered successfully.",

            school: {
                id: school._id,
                name: school.name,
                email: school.email,
                phone: school.phone,
                address: school.address,
                school_type: school.school_type,
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

            user: {
                id: user._id,
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
                "Registration failed."
        });
    }
};


// =========================================================
// LOGIN
// =========================================================

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
            email.trim().toLowerCase();

        const user = await User
            .findOne({
                email: normalizedEmail
            })
            .select("+password");

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."
            });
        }

        const token =
            jwt.sign(

                {
                    id: user._id,
                    school_id:
                        user.school_id,
                    role:
                        user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );

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
                    user.school_id
            }
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


// =========================================================
// GET LOGGED-IN PROFILE
// =========================================================

exports.getProfile = async (req, res) => {

    try {

        const user =
            await User
                .findById(req.user.id)
                .select("-password");

        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."
            });
        }

        const school =
            await School.findById(
                user.school_id
            );

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
