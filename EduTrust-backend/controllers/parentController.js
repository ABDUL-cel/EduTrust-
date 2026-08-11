const Parent = require("../models/Parent");
const User = require("../models/User");
const School = require("../models/school");

/* ==========================================================================
   1. SEARCH SCHOOLS
   PUBLIC
   Used by Parent / Student / Staff self-registration
   ========================================================================== */

const searchSchools = async (req, res) => {
    try {
        const search = String(
            req.query.search || ""
        ).trim();

        if (search.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter at least 2 characters to search."
            });
        }

        const schools = await School.find({
            status: "Active",
            name: {
                $regex: search,
                $options: "i"
            }
        })
            .select(
                "_id name email address school_type logo website"
            )
            .sort({
                name: 1
            })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            count: schools.length,
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
                "Failed to search schools.",
            error: error.message
        });
    }
};


/* ==========================================================================
   2. REGISTER / CREATE PARENT

   Parent can register themselves.

   The parent selects a school first.
   The selected school_id is then sent with the registration.
   ========================================================================== */

const registerParent = async (req, res) => {
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
            school_id
        } = req.body;


        // =======================================
        // SCHOOL IS REQUIRED
        // =======================================

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select your school before registering."
            });
        }


        // =======================================
        // VERIFY SCHOOL EXISTS
        // =======================================

        const school = await School.findOne({
            _id: school_id,
            status: "Active"
        }).lean();

        if (!school) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected school was not found or is not active."
            });
        }


        // =======================================
        // REQUIRED PARENT INFORMATION
        // =======================================

        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !relationship?.trim() ||
            !phone?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship and phone are required."
            });
        }


        // =======================================
        // NORMALIZE PHONE
        // =======================================

        const normalizedPhone =
            phone.trim();


        // =======================================
        // CHECK DUPLICATE PHONE
        // ONLY INSIDE THIS SCHOOL
        // =======================================

        const existingParent =
            await Parent.findOne({
                school_id,
                phone: normalizedPhone
            });

        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number already exists in this school."
            });
        }


        // =======================================
        // CREATE PARENT
        // =======================================

        const newParent =
            await Parent.create({

                school_id,

                first_name:
                    first_name.trim(),

                last_name:
                    last_name.trim(),

                other_name:
                    other_name
                        ? other_name.trim()
                        : "",

                relationship:
                    relationship.trim(),

                email:
                    email
                        ? email.trim().toLowerCase()
                        : "",

                phone:
                    normalizedPhone,

                alternate_phone:
                    alternate_phone
                        ? alternate_phone.trim()
                        : "",

                home_address:
                    home_address
                        ? home_address.trim()
                        : "",

                occupation:
                    occupation
                        ? occupation.trim()
                        : "",

                passport:
                    passport || "",

                status: "Active"
            });


        // =======================================
        // SUCCESS
        // =======================================

        return res.status(201).json({

            success: true,

            message:
                "Parent registration completed successfully.",

            parent: newParent,

            school: {
                _id: school._id,
                name: school.name
            }
        });

    } catch (error) {

        console.error(
            "REGISTER PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to register parent.",
            error: error.message
        });
    }
};


/* ==========================================================================
   3. PARENT LOGIN
   Temporary compatibility handler

   IMPORTANT:
   This is NOT full password authentication yet.
   We will connect this properly to User.js/authentication next.
   ========================================================================== */

const loginParent = async (req, res) => {
    try {

        const {
            phone,
            email
        } = req.body;


        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone or email is required."
            });
        }


        const conditions = [];


        if (phone) {
            conditions.push({
                phone: phone.trim()
            });
        }


        if (email) {
            conditions.push({
                email:
                    email.trim().toLowerCase()
            });
        }


        const parent =
            await Parent.findOne({
                $or: conditions
            }).lean();


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent account not found."
            });
        }


        return res.status(200).json({

            success: true,

            message:
                "Parent account located.",

            parent

        });

    } catch (error) {

        console.error(
            "PARENT LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Parent login failed.",
            error: error.message
        });
    }
};


/* ==========================================================================
   4. GET PARENT PROFILE
   For authenticated parent
   ========================================================================== */

const getParentProfile = async (req, res) => {
    try {

        const parentId =
            req.user?.parent_id ||
            req.user?.parentId;


        if (!parentId) {
            return res.status(401).json({
                success: false,
                message:
                    "Parent authentication required."
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
                "Failed to load parent profile.",
            error: error.message
        });
    }
};


/* ==========================================================================
   5. GET ALL PARENTS
   PRINCIPAL ONLY

   Only parents belonging to the principal's
   school are returned.
   ========================================================================== */

const getParents = async (req, res) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }


        const principal =
            await User.findById(
                userId
            ).lean();


        if (!principal) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }


        const schoolId =
            principal.school_id ||
            principal.schoolId;


        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }


        const parents =
            await Parent.find({
                school_id: schoolId
            })
                .sort({
                    created_at: -1
                })
                .lean();


        return res.status(200).json({

            success: true,

            count:
                parents.length,

            parents

        });

    } catch (error) {

        console.error(
            "GET PARENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parents.",
            error: error.message
        });
    }
};


/* ==========================================================================
   6. GET ONE PARENT
   PRINCIPAL ONLY
   ========================================================================== */

const getParentById = async (req, res) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;

        const parentId =
            req.params.id;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }


        const principal =
            await User.findById(
                userId
            ).lean();


        if (!principal) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }


        const schoolId =
            principal.school_id ||
            principal.schoolId;


        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }


        const parent =
            await Parent.findOne({

                _id: parentId,

                school_id: schoolId

            }).lean();


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found."
            });
        }


        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {

        console.error(
            "GET PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent.",
            error: error.message
        });
    }
};


/* ==========================================================================
   EXPORTS
   ========================================================================== */

module.exports = {

    registerParent,

    loginParent,

    getParentProfile,

    getParents,

    getParentById,

    searchSchools

};
