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
            motto,
            website,
            logo,
            principal_name,
            principal_email,
            password
        } = req.body;

        // --------------------------------------------------
        // Validate required registration fields
        // --------------------------------------------------

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

        // --------------------------------------------------
        // Normalize values
        // --------------------------------------------------

        const schoolName = String(school_name).trim();
        const schoolEmail = String(school_email).trim().toLowerCase();
        const principalName = String(principal_name).trim();
        const principalEmail = String(principal_email).trim().toLowerCase();

        // --------------------------------------------------
        // Check duplicate school
        // School schema uses: email
        // --------------------------------------------------

        const existingSchool = await School.findOne({
            email: schoolEmail
        });

        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "A school with this email already exists."
            });
        }

        // --------------------------------------------------
        // Check duplicate principal/user
        // --------------------------------------------------

        const existingUser = await User.findOne({
            email: principalEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // --------------------------------------------------
        // Hash password
        // --------------------------------------------------

        const hashedPassword = await bcrypt.hash(password, 10);

        // --------------------------------------------------
        // Create school
        //
        // IMPORTANT:
        // School model uses name/email, NOT
        // school_name/school_email.
        // --------------------------------------------------

        const school = await School.create({
            name: schoolName,
            email: schoolEmail,
            phone: phone || "",
            address: address || "",
            school_type: school_type || "",
            academic_session: academic_session || "",
            current_term: current_term || "",
            motto: school_motto || motto || "",
            website: website || "",
            logo: logo || "",
            status: "Active"
        });

        // --------------------------------------------------
        // Create principal/user
        //
        // We keep both the normal user fields and the
        // principal/school fields used by your current User
        // validation.
        // --------------------------------------------------

        let user;

        try {
            user = await User.create({
                school_id: school._id,

                // Normal account fields
                full_name: principalName,
                email: principalEmail,
                phone: phone || "",
                password: hashedPassword,
                role: "Principal",

                // Fields required by the current User schema
                school_name: schoolName,
                principal_name: principalName,
                principal_email: principalEmail
            });
        } catch (userError) {

            // --------------------------------------------------
            // Roll back school if User creation fails
            // --------------------------------------------------

            await School.findByIdAndDelete(school._id);

            throw userError;
        }

        // --------------------------------------------------
        // Link principal back to school
        // --------------------------------------------------

        school.principal_id = user._id;

        await school.save();

        // --------------------------------------------------
        // Success response
        // --------------------------------------------------

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
                school_id: user.school_id,
                school_name: user.school_name,
                principal_name: user.principal_name,
                principal_email: user.principal_email
            }
        });

    } catch (error) {

        console.error("REGISTER SCHOOL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "School registration failed."
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

        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // --------------------------------------------------
        // Create JWT
        // --------------------------------------------------

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

        // --------------------------------------------------
        // Return user
        // --------------------------------------------------

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
                school_name: user.school_name,
                principal_name: user.principal_name,
                principal_email: user.principal_email
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

        const user = await User
            .findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // --------------------------------------------------
        // Get school information too
        // --------------------------------------------------

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
            "GET PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to load profile."
        });
    }
};
