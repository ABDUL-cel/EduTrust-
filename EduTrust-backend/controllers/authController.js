
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const School = require("../models/school");

const JWT_SECRET =
    process.env.JWT_SECRET || "edutrust_fallback_secret_key";


// =======================================
// Generate JWT
// =======================================
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            school_id: user.school_id || null
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


// =======================================
// Register User / School
// =======================================
exports.registerUser = async (req, res) => {
    try {
        const {
            principal_name,
            principal_email,
            school_email
            phone,
            password,
            school_name,
            school_type,
            academic_session,
            current_term,
            address,
            school_motto,
            logo,
            website
        } = req.body;

        // -----------------------------------
        // Required fields
        // -----------------------------------
        if (
            !principal_name ||
            !principal_email ||
            !phone ||
            !password ||
            !school_name
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "principal name, principal email, phone, password and school name are required."
            });
        }

        // -----------------------------------
        // Check existing user
        // -----------------------------------
        const existingUser = await User.findOne({
            email: principal_email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // -----------------------------------
        // Hash password
        // -----------------------------------
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // -----------------------------------
        // Create principal first
        // -----------------------------------
        const user = await User.create({
            principal_name,
            email: principal_email.toLowerCase().trim(),
            phone,
            password: hashedPassword,

            // Principal owns the initial school account
            role: "Principal",

            school_name,
            school_type: school_type || "",
            academic_session: academic_session || "",
            current_term: current_term || "",
            address: address || "",
            school_motto: school_motto || "",
            website: website || "",
            logo: logo || "",

            status: "Active"
        });

        // -----------------------------------
        // Create School
        // -----------------------------------
        const school = await School.create({
            name: school_name,
            email: school_email.toLowerCase().trim(),
            phone,
            address: address || "",
            school_type: school_type || "",
            academic_session: academic_session || "",
            current_term: current_term || "",
            motto: school_motto || "",
            website: website || "",

            principal_id: user._id,

            status: "Active"
        });

        // -----------------------------------
        // Link user to School
        // -----------------------------------
        user.school_id = school._id;

        await user.save();

        // -----------------------------------
        // Generate token
        // -----------------------------------
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "School account registered successfully.",

            token,

            user: {
                id: user._id,
                principal_name: user.principal_name,
                principal_email: user.principal_email,
                phone: user.phone,
                role: user.role,
                school_id: user.school_id
            },

            school: {
                id: school._id,
                name: school.name,
                status: school.status
            }
        });

    } catch (error) {
        console.error(
            "REGISTER USER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Login
// =======================================
exports.loginUser = async (req, res) => {
    try {
        const {
            principal_email,
            password
        } = req.body;

        if (!principal_email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: principal_email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is not active."
            });
        }

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

        // -----------------------------------
        // Update last login
        // -----------------------------------
        user.last_login = new Date();

        await user.save();

        // -----------------------------------
        // Generate token
        // -----------------------------------
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful.",

            token,

            user: {
                id: user._id,
                principal_name: user.principal_name,
                principal_email: user.principal_email,
                phone: user.phone,
                role: user.role,
                school_id: user.school_id
            }
        });

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Logged-in User
// =======================================
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        let school = null;

        if (user.school_id) {
            school = await School.findById(
                user.school_id
            );
        }

        return res.status(200).json({
            success: true,

            user,

            school
        });

    } catch (error) {
        console.error(
            "GET ME ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
