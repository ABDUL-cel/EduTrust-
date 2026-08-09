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

        // ==============================================
        // REQUIRED DATA
        // ==============================================

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

        const cleanSchoolName = school_name.trim();
        const cleanSchoolEmail = school_email.trim().toLowerCase();
        const cleanPrincipalName = principal_name.trim();
        const cleanPrincipalEmail = principal_email.trim().toLowerCase();

        // ==============================================
        // CHECK EXISTING SCHOOL
        // ==============================================

        const existingSchool = await School.findOne({
            email: cleanSchoolEmail
        });

        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "A school with this email already exists."
            });
        }

        // ==============================================
        // CHECK EXISTING USER
        // ==============================================

        const existingUser = await User.findOne({
            email: cleanPrincipalEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // ==============================================
        // HASH PASSWORD
        // ==============================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // ==============================================
        // CREATE SCHOOL
        // ==============================================

        const school = await School.create({
            name: cleanSchoolName,
            email: cleanSchoolEmail,

            phone: phone
                ? phone.trim()
                : "",

            address: address
                ? address.trim()
                : "",

            school_type: school_type
                ? school_type.trim()
                : "",

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

        // ==============================================
        // CREATE PRINCIPAL USER
        //
        // IMPORTANT:
        // Your CURRENT User schema requires:
        // school_name
        // principal_name
        // principal_email
        //
        // So we provide all three.
        // ==============================================

        const user = await User.create({

            school_id: school._id,

            // Existing User fields
            full_name: cleanPrincipalName,
            email: cleanPrincipalEmail,

            phone: phone
                ? phone.trim()
                : "",

            password: hashedPassword,

            role: "Principal",

            // Required by CURRENT User schema
            school_name: cleanSchoolName,

            principal_name: cleanPrincipalName,

            principal_email: cleanPrincipalEmail
        });

        // ==============================================
        // LINK PRINCIPAL TO SCHOOL
        // ==============================================

        school.principal_id = user._id;

        await school.save();

        // ==============================================
        // SUCCESS RESPONSE
        // ==============================================

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
                    user.school_id,

                school_name:
                    user.school_name,

                principal_name:
                    user.principal_name,

                principal_email:
                    user.principal_email
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
