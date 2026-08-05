const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const School = require("../models/school");
const User = require("../models/user");

// =======================================
// Register School
// =======================================
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

        // Check if school already exists
        const existingSchool = await School.findOne({
            school_email
        });

        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "School already exists."
            });
        }

        // Check if principal email already exists
        const existingUser = await User.findOne({
            email: principal_email
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Principal email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create School
        const school = await School.create({
            school_name,
            school_email,
            phone,
            address,
            school_type,
            academic_session,
            current_term,
            school_motto,
            website,
            logo
        });

        // Create Principal User
        const user = await User.create({
            school_id: school._id,
            full_name: principal_name,
            email: principal_email,
            phone,
            password: hashedPassword,
            role: "Principal"
        });

        // Link principal to school
        school.principal = user._id;
        await school.save();

        res.status(201).json({
            success: true,
            message: "School registered successfully.",

            school: {
                id: school._id,
                school_name: school.school_name,
                school_email: school.school_email,
                phone: school.phone,
                address: school.address,
                school_type: school.school_type,
                academic_session: school.academic_session,
                current_term: school.current_term,
                school_motto: school.school_motto,
                website: school.website,
                logo: school.logo,
                principal: school.principal
            },

            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                school_id: user.school_id
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// =======================================
// Login
// =======================================
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        // Update last login
        user.last_login = new Date();

        await user.save();

        // Generate Token
        const token = jwt.sign(
            {
                id: user._id,
                school_id: user.school_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            user: {

                id: user._id,

                full_name: user.full_name,

                email: user.email,

                role: user.role,

                school_id: user.school_id

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =======================================
// Get Logged-in User
// =======================================
exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("school_id");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
