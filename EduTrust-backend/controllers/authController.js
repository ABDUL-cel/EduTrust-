const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const School = require("../models/school");
const User = require("../models/user");

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
            website,
            logo,
            principal_name,
            principal_email,
            password
        } = req.body;

        // ----------------------------------------------
        // Validate required fields
        // ----------------------------------------------
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

        // ----------------------------------------------
        // Normalize values
        // ----------------------------------------------
        const cleanSchoolName = school_name.trim();
        const cleanSchoolEmail = school_email.trim().toLowerCase();
        const cleanPrincipalName = principal_name.trim();
        const cleanPrincipalEmail = principal_email.trim().toLowerCase();

        // ----------------------------------------------
        // Check school email
        // ----------------------------------------------
        const existingSchool = await School.findOne({
            email: cleanSchoolEmail
        });

        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "A school with this email already exists."
            });
        }

        // ----------------------------------------------
        // Check principal email
        // ----------------------------------------------
        const existingUser = await User.findOne({
            email: cleanPrincipalEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this principal email already exists."
            });
        }

        // ----------------------------------------------
        // Hash password
        // ----------------------------------------------
        const hashedPassword = await bcrypt.hash(password, 10);

        // ----------------------------------------------
        // Create School
        // ----------------------------------------------
        const school = await School.create({
            name: cleanSchoolName,
            email: cleanSchoolEmail,
            phone: phone ? phone.trim() : "",
            address: address ? address.trim() : "",
            school_type: school_type ? school_type.trim() : "",
            academic_session: academic_session
                ? academic_session.trim()
                : "",
            current_term: current_term
                ? current_term.trim()
                : "",
            motto: school_motto
                ? school_motto.trim()
                : "",
            website: website
                ? website.trim()
                : "",
            logo: logo
                ? logo.trim()
                : "",
            status: "Active"
        });

        // ----------------------------------------------
        // Create Principal/User
        // ----------------------------------------------
        const user = await User.create({
            school_id: school._id,
            full_name: cleanPrincipalName,
            email: cleanPrincipalEmail,
            phone: phone ? phone.trim() : "",
            password: hashedPassword,
            role: "Principal"
        });

        // ----------------------------------------------
        // Link principal to school
        // ----------------------------------------------
        school.principal_id = user._id;
        await school.save();

        // ----------------------------------------------
        // Response
        // ----------------------------------------------
        return res.status(201).json({
            success: true,
            message: "School registered successfully.",
            school: {
                id: school._id,
                name: school.name,
                email: school.email,
                phone: school.phone,
                address: school.address,
                school_type: school.school_type,
                academic_session: school.academic_session,
                current_term: school.current_term,
                motto: school.motto,
                website: school.website,
                logo: school.logo,
                principal_id: school.principal_id,
                status: school.status
            },
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                school_id: user.school_id
            }
        });

    } catch (error) {
        console.error("REGISTER SCHOOL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Registration failed."
        });
    }
};


// ======================================================
// LOGIN
// ======================================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail
        });

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

        // Get school information
        const school = await School.findById(
            user.school_id
        ).lean();

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,

            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                school_id: user.school_id,

                school_name: school
                    ? school.name
                    : "",

                school_email: school
                    ? school.email
                    : "",

                address: school
                    ? school.address
                    : "",

                school_type: school
                    ? school.school_type
                    : "",

                academic_session: school
                    ? school.academic_session
                    : "",

                current_term: school
                    ? school.current_term
                    : "",

                motto: school
                    ? school.motto
                    : "",

                website: school
                    ? school.website
                    : "",

                logo: school
                    ? school.logo
                    : ""
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Login failed."
        });
    }
};


// ======================================================
// GET LOGGED-IN USER PROFILE
// ======================================================
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(
            req.user.id
        )
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const school = await School.findById(
            user.school_id
        ).lean();

        return res.status(200).json({
            success: true,

            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                school_id: user.school_id,

                school_name: school
                    ? school.name
                    : "",

                school_email: school
                    ? school.email
                    : "",

                address: school
                    ? school.address
                    : "",

                school_type: school
                    ? school.school_type
                    : "",

                academic_session: school
                    ? school.academic_session
                    : "",

                current_term: school
                    ? school.current_term
                    : "",

                motto: school
                    ? school.motto
                    : "",

                website: school
                    ? school.website
                    : "",

                logo: school
                    ? school.logo
                    : ""
            }
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to load profile."
        });
    }
};
