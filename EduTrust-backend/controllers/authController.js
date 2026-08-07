const User = require("../models/user");
const School = require("../models/school");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET || "edutrust_fallback_secret_key";

const JWT_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN || "1d";

/**
 * ==========================================
 * REGISTER SCHOOL ACCOUNT
 * POST /api/auth/register
 * Public
 * ==========================================
 */
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
            principal_name,
            principal_email,
            password
        } = req.body;

        // ==========================================
        // Validate required fields
        // ==========================================
        if (
            !school_name ||
            !school_email ||
            !phone ||
            !principal_name ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill out all required fields."
            });
        }

        const normalizedSchoolEmail = school_email
            .toLowerCase()
            .trim();

        // ==========================================
        // Check if school email already exists
        // ==========================================
        const existingUser = await User.findOne({
            email: normalizedSchoolEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    "A user with this school email already exists."
            });
        }

        // ==========================================
        // Create School
        // ==========================================
        const school = await School.create({
            name: school_name,
            email: normalizedSchoolEmail,
            phone,
            address: address || "",
            school_type: school_type || "",
            academic_session: academic_session || "",
            current_term: current_term || "",
            school_motto: school_motto || "",
            website: website || "",
            status: "Active"
        });

        // ==========================================
        // Hash password
        // ==========================================
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        // ==========================================
        // Create Principal/User
        // ==========================================
        const newUser = await User.create({
            school_id: school._id,

            full_name: principal_name,

            email: normalizedSchoolEmail,

            phone,

            password: hashedPassword,

            school_name,

            school_type: school_type || "",

            academic_session:
                academic_session || "",

            current_term:
                current_term || "",

            address: address || "",

            school_motto:
                school_motto || "",

            website:
                website || "",

            role: "Principal",

            status: "Active"
        });

        // ==========================================
        // Generate JWT
        // ==========================================
        const token = jwt.sign(
            {
                id: newUser._id,
                school_id: school._id,
                role: newUser.role
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );

        // ==========================================
        // Response
        // ==========================================
        return res.status(201).json({
            success: true,

            message:
                "School account created successfully!",

            token,

            user: {
                id: newUser._id,

                school_id: school._id,

                full_name:
                    newUser.full_name,

                email:
                    newUser.email,

                role:
                    newUser.role,

                school_name:
                    newUser.school_name,

                phone:
                    newUser.phone,

                address:
                    newUser.address,

                school_type:
                    newUser.school_type,

                academic_session:
                    newUser.academic_session,

                current_term:
                    newUser.current_term
            }
        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error during registration.",
            error: error.message
        });
    }
};


/**
 * ==========================================
 * LOGIN USER
 * POST /api/auth/login
 * Public
 * ==========================================
 */
exports.loginUser = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        // ==========================================
        // Validate input
        // ==========================================
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide email and password."
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // ==========================================
        // Find user
        // ==========================================
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials."
            });
        }

        // ==========================================
        // Check password
        // ==========================================
        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials."
            });
        }

        // ==========================================
        // Check account status
        // ==========================================
        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message:
                    `Your account is ${user.status.toLowerCase()}. Please contact the school administrator.`
            });
        }

        // ==========================================
        // Update last login
        // ==========================================
        user.last_login = new Date();

        await user.save();

        // ==========================================
        // Generate JWT
        // ==========================================
        const token = jwt.sign(
            {
                id: user._id,
                school_id: user.school_id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );

        // ==========================================
        // Response
        // ==========================================
        return res.status(200).json({
            success: true,

            message:
                "Login successful.",

            token,

            user: {
                id: user._id,

                school_id:
                    user.school_id,

                full_name:
                    user.full_name,

                email:
                    user.email,

                role:
                    user.role,

                school_name:
                    user.school_name,

                phone:
                    user.phone,

                address:
                    user.address,

                school_type:
                    user.school_type,

                academic_session:
                    user.academic_session,

                current_term:
                    user.current_term
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
                "Server error during login.",
            error: error.message
        });
    }
};


/**
 * ==========================================
 * GET CURRENT USER
 * GET /api/auth/profile
 * Private
 * ==========================================
 */
exports.getMe = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.user.id
            ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.error(
            "GET ME ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error retrieving user.",
            error: error.message
        });
    }
};
