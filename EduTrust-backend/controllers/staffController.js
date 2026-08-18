
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const STAFF_ROLES = [
    "Vice Principal",
    "Bursar",
    "Teacher",
    "Accountant",
    "Secretary"
];


// =======================================
// Create Staff
// =======================================
exports.createStaff = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const {
            full_name,
            email,
            phone,
            password,
            role
        } = req.body;

        if (
            !full_name ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, email, phone, password and role are required."
            });
        }

        if (!STAFF_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid staff role."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    "A user with this email already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const staff = await User.create({
            full_name,
            email: email.toLowerCase().trim(),
            phone,
            password: hashedPassword,
            role,
            school_id,
            status: "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Staff account created successfully.",
            staff: {
                id: staff._id,
                full_name: staff.full_name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                status: staff.status,
                school_id: staff.school_id
            }
        });

    } catch (error) {
        console.error("CREATE STAFF ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get School Staff
// =======================================
exports.getStaff = async (req, res) => {
    try {
        const staff = await User.find({
            school_id: req.user.school_id,
            role: {
                $in: STAFF_ROLES
            }
        })
            .select("-password")
            .sort({
                created_at: -1
            });

        return res.status(200).json({
            success: true,
            count: staff.length,
            staff
        });

    } catch (error) {
        console.error("GET STAFF ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Single Staff
// =======================================
exports.getStaffMember = async (req, res) => {
    try {
        const staff = await User.findOne({
            _id: req.params.id,
            school_id: req.user.school_id,
            role: {
                $in: STAFF_ROLES
            }
        }).select("-password");

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        return res.status(200).json({
            success: true,
            staff
        });

    } catch (error) {
        console.error("GET STAFF MEMBER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Suspend Staff
// =======================================
exports.suspendStaff = async (req, res) => {
    try {
        const staff = await User.findOne({
            _id: req.params.id,
            school_id: req.user.school_id,
            role: {
                $in: STAFF_ROLES
            }
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        staff.status = "Suspended";

        await staff.save();

        return res.status(200).json({
            success: true,
            message: "Staff member suspended successfully."
        });

    } catch (error) {
        console.error("SUSPEND STAFF ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Activate Staff
// =======================================
exports.activateStaff = async (req, res) => {
    try {
        const staff = await User.findOne({
            _id: req.params.id,
            school_id: req.user.school_id,
            role: {
                $in: STAFF_ROLES
            }
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        staff.status = "Active";

        await staff.save();

        return res.status(200).json({
            success: true,
            message: "Staff member activated successfully."
        });

    } catch (error) {
        console.error("ACTIVATE STAFF ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// =======================================
// Update Staff
// =======================================
exports.updateStaff = async (req, res) => {
    try {
        const { full_name, phone, role } = req.body;

        if (role && !STAFF_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid staff role."
            });
        }

        const staff = await User.findOne({
            _id: req.params.id,
            school_id: req.user.school_id,
            role: { $in: STAFF_ROLES }
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        if (full_name) staff.full_name = full_name.trim();
        if (phone) staff.phone = phone.trim();
        if (role) staff.role = role;

        await staff.save();

        return res.status(200).json({
            success: true,
            message: "Staff member updated successfully.",
            staff: {
                id: staff._id,
                full_name: staff.full_name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                status: staff.status
            }
        });

    } catch (error) {
        console.error("UPDATE STAFF ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

