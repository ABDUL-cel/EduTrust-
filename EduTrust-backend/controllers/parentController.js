// controllers/parentController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");
const School = require("../models/school");
// ============================================================
// REGISTER PARENT
// ============================================================
exports.registerParent = async (req, res) => {
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
            school_id,
            password
        } = req.body;

        // --------------------------------------------------
        // VALIDATION
        // --------------------------------------------------

        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !relationship?.trim() ||
            !phone?.trim() ||
            !school_id ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship, phone, password and school are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        // --------------------------------------------------
        // FIND SCHOOL
        // --------------------------------------------------

        const school = await School.findOne({
            _id: school_id,
            status: "Active"
        });

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Selected school was not found or is not active."
            });
        }

        const cleanPhone = phone.trim();
        const cleanEmail = email?.trim().toLowerCase() || "";

        // --------------------------------------------------
        // CHECK PARENT DUPLICATE
        // --------------------------------------------------

        const parentConditions = [
            {
                school_id,
                phone: cleanPhone
            }
        ];

        if (cleanEmail) {
            parentConditions.push({
                school_id,
                email: cleanEmail
            });
        }

        const existingParent = await Parent.findOne({
            $or: parentConditions
        });

        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number or email already exists in this school."
            });
        }

        // --------------------------------------------------
        // CHECK USER DUPLICATE
        // --------------------------------------------------

        const userConditions = [
            {
                school_id,
                phone: cleanPhone
            }
        ];

        if (cleanEmail) {
            userConditions.push({
                school_id,
                email: cleanEmail
            });
        }

        const existingUser = await User.findOne({
            $or: userConditions
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "A user account with this phone number or email already exists in this school."
            });
        }

        // --------------------------------------------------
        // HASH PASSWORD
        // --------------------------------------------------

        const hashedPassword = await bcrypt.hash(password, 10);

        // --------------------------------------------------
        // CREATE PARENT PROFILE
        // --------------------------------------------------

        const parent = await Parent.create({
            school_id,

            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name?.trim() || "",

            relationship: relationship.trim(),

            email: cleanEmail,
            phone: cleanPhone,

            alternate_phone:
                alternate_phone?.trim() || "",

            home_address:
                home_address?.trim() || "",

            occupation:
                occupation?.trim() || "",

            passport:
                passport || "",

            status: "Active"
        });

        // --------------------------------------------------
        // CREATE LOGIN USER
        // --------------------------------------------------

        const user = await User.create({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name?.trim() || "",

            full_name: [
                first_name.trim(),
                other_name?.trim(),
                last_name.trim()
            ]
                .filter(Boolean)
                .join(" "),

            email: cleanEmail,
            phone: cleanPhone,

            password: hashedPassword,

            role: "Parent",
            status: "Active",

            // THIS IS THE IMPORTANT PART
            school_id: school._id,
            parent_id: parent._id
        });

        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Parent registered successfully.",

            parent: {
                id: parent._id,
                fullName: user.full_name,
                school_id: school._id
            }
        });

    } catch (error) {
        console.error("REGISTER PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to register parent.",
            error: error.message
        });
    }
};

// ============================================================
// SEARCH SCHOOLS
// ============================================================
exports.searchSchools = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();

        if (search.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter at least 2 characters."
            });
        }

        const schools = await School.find({
            status: "Active",
            name: { $regex: search, $options: "i" }
        })
            .select("_id name email address school_type logo website")
            .sort({ name: 1 })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            count: schools.length,
            schools
        });

    } catch (error) {
        console.error("SEARCH SCHOOLS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search schools.",
            error: error.message
        });
    }
};

// ============================================================
// PARENT LOGIN
// ============================================================
exports.loginParent = async (req, res) => {
    try {
        const {
            phone,
            email,
            password
        } = req.body;

        const identifier =
            phone?.trim() ||
            email?.trim();

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email is required."
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required."
            });
        }

        // --------------------------------------------------
        // FIND PARENT USER ACCOUNT
        // --------------------------------------------------

        const conditions = [
            {
                phone: identifier
            }
        ];

        if (identifier.includes("@")) {
            conditions.push({
                email: identifier.toLowerCase()
            });
        }

        const user = await User.findOne({
            role: "Parent",
            status: "Active",
            $or: conditions
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone/email or password."
            });
        }

        // --------------------------------------------------
        // MAKE SURE USER IS LINKED TO PARENT
        // --------------------------------------------------

        if (!user.parent_id) {
            return res.status(403).json({
                success: false,
                message:
                    "This parent account is not linked to a parent profile."
            });
        }

        if (!user.school_id) {
            return res.status(403).json({
                success: false,
                message:
                    "This parent account is not linked to a school."
            });
        }

        // --------------------------------------------------
        // CHECK PASSWORD
        // --------------------------------------------------

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone/email or password."
            });
        }

        // --------------------------------------------------
        // CREATE ONE AUTH TOKEN
        // --------------------------------------------------

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,

                // These are useful immediately,
                // but the middleware will also read them
                // from the User document.
                school_id: user.school_id,
                parent_id: user.parent_id
            },
            process.env.JWT_SECRET ||
                "edutrust_fallback_secret_key",
            {
                expiresIn: "7d"
            }
        );

        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Parent login successful.",

            token,

            redirectUrl:
                "/parent-dashboard.html"
        });

    } catch (error) {
        console.error("PARENT LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Parent login failed.",
            error: error.message
        });
    }
};

// ============================================================
// GET PARENT PROFILE
// ============================================================
exports.getParentProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const parentId = req.user?.parent_id;

        let parent = null;

        if (parentId) {
            parent = await Parent.findById(parentId).lean();
        }

        if (!parent && userId) {
            const user = await User.findById(userId).lean();

            if (user?.parent_id) {
                parent = await Parent.findById(user.parent_id).lean();
            }
        }

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {
        console.error("GET PARENT PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load parent profile.",
            error: error.message
        });
    }
};

// ============================================================
// UPDATE PARENT PROFILE (NEW)
// ============================================================
exports.updateParentProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        let parentId = req.user?.parent_id;

        if (!parentId && userId) {
            const user = await User.findById(userId).lean();
            parentId = user?.parent_id;
        }

        if (!parentId) {
            return res.status(404).json({
                success: false,
                message: "Parent profile reference not found."
            });
        }

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
            passport
        } = req.body;

        const updateFields = {};
        if (first_name) updateFields.first_name = first_name.trim();
        if (last_name) updateFields.last_name = last_name.trim();
        if (other_name !== undefined) updateFields.other_name = other_name.trim();
        if (relationship) updateFields.relationship = relationship.trim();
        if (email) updateFields.email = email.trim().toLowerCase();
        if (phone) updateFields.phone = phone.trim();
        if (alternate_phone !== undefined) updateFields.alternate_phone = alternate_phone.trim();
        if (home_address !== undefined) updateFields.home_address = home_address.trim();
        if (occupation !== undefined) updateFields.occupation = occupation.trim();
        if (passport !== undefined) updateFields.passport = passport;

        const updatedParent = await Parent.findByIdAndUpdate(
            parentId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).lean();

        return res.status(200).json({
            success: true,
            message: "Parent profile updated successfully.",
            parent: updatedParent
        });

    } catch (error) {
        console.error("UPDATE PARENT PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update parent profile.",
            error: error.message
        });
    }
};

// ============================================================
// GET ALL PARENTS
// ============================================================
exports.getParents = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const parents = await Parent.find({ school_id })
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: parents.length,
            parents
        });

    } catch (error) {
        console.error("GET PARENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load parents.",
            error: error.message
        });
    }
};

// ============================================================
// GET ONE PARENT
// ============================================================
exports.getParentById = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const parent = await Parent.findOne({
            _id: req.params.id,
            school_id
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {
        console.error("GET PARENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load parent.",
            error: error.message
        });
    }
};

// ============================================================
// UPDATE PARENT BY ID (FOR SCHOOL ADMIN/STAFF) (NEW)
// ============================================================
exports.updateParentById = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const updatedParent = await Parent.findOneAndUpdate(
            { _id: req.params.id, school_id },
            { $set: req.body },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedParent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found or unauthorized to update."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent details updated successfully.",
            parent: updatedParent
        });

    } catch (error) {
        console.error("UPDATE PARENT BY ID ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update parent details.",
            error: error.message
        });
    }
};

// ============================================================
// PARENT DASHBOARD
// ============================================================
exports.getParentDashboard = async (req, res) => {
    try {
        let parentId = req.user?.parent_id;
        const userId = req.user?.id || req.user?._id;

        if (!parentId && userId) {
            const user = await User.findById(userId).lean();
            parentId = user?.parent_id;
        }

        if (!parentId) {
            return res.status(403).json({
                success: false,
                message: "This account is not linked to a parent profile."
            });
        }

        const parent = await Parent.findById(parentId).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found."
            });
        }

        const children = await Student.find({
            parent_id: parent._id,
            school_id: parent.school_id
        })
            .sort({ created_at: -1 })
            .lean();

        const formattedChildren = children.map(child => ({
            id: child._id,
            fullName: [child.first_name, child.other_name, child.last_name]
                .filter(Boolean)
                .join(" "),
            admissionNumber: child.admission_number,
            className: child.class_name,
            arm: child.arm,
            gender: child.gender,
            dateOfBirth: child.date_of_birth,
            admissionDate: child.admission_date,
            status: child.status,
            passport: child.passport
        }));

        const activeChildren = children.filter(child => child.status === "Active").length;
        const pendingChildren = children.filter(child => child.status === "Pending").length;
        const suspendedChildren = children.filter(child => child.status === "Suspended").length;

        const fullName = [parent.first_name, parent.other_name, parent.last_name]
            .filter(Boolean)
            .join(" ");

        return res.status(200).json({
            success: true,
            dashboard: {
                parent: {
                    id: parent._id,
                    fullName,
                    relationship: parent.relationship,
                    email: parent.email,
                    phone: parent.phone,
                    alternatePhone: parent.alternate_phone,
                    homeAddress: parent.home_address,
                    occupation: parent.occupation,
                    passport: parent.passport,
                    schoolId: parent.school_id,
                    status: parent.status
                },
                statistics: {
                    totalChildren: children.length,
                    activeChildren,
                    pendingChildren,
                    suspendedChildren
                },
                children: formattedChildren
            }
        });

    } catch (error) {
        console.error("GET PARENT DASHBOARD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load parent dashboard.",
            error: error.message
        });
    }
};
