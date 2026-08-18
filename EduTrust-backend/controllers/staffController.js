const bcrypt = require("bcryptjs");
const User = require("../models/User");
const School = require("../models/School");

const STAFF_ROLES = [
  "Vice Principal",
  "Bursar",
  "Teacher",
  "Accountant",
  "Secretary"
];

// ======================================================
// REGISTER STAFF (SELF-REGISTRATION VIA SCHOOL CODE)
// ======================================================
exports.registerStaff = async (req, res) => {
  try {
    const { full_name, email, phone, password, school_code } = req.body;

    if (!full_name || !email || !password || !school_code) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and school code are required."
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(school_code).trim().toUpperCase();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // 2. Validate School Code
    const school = await School.findOne({ school_code: normalizedCode });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Invalid school code. Please verify with your principal."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nameParts = full_name.trim().split(" ");

    // 3. Create Staff with 'Pending' status
    await User.create({
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone: phone || "",
      password: hashedPassword,
      role: "PendingStaff",
      status: "Pending",
      school_id: school._id
    });

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully! Please wait for your Principal to approve your account."
    });

  } catch (error) {
    console.error("STAFF REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Staff registration failed."
    });
  }
};

// ======================================================
// GET ALL PENDING STAFF FOR THE PRINCIPAL'S SCHOOL
// ======================================================
exports.getPendingStaff = async (req, res) => {
  try {
    const pendingStaff = await User.find({
      school_id: req.user.school_id,
      status: "Pending"
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: pendingStaff.length,
      data: pendingStaff
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pending requests."
    });
  }
};

// ======================================================
// APPROVE & ASSIGN ROLE TO STAFF
// ======================================================
exports.approveStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { role } = req.body;

    if (!role || !STAFF_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid staff role: ${STAFF_ROLES.join(", ")}`
      });
    }

    const staff = await User.findOne({
      _id: staff_id,
      school_id: req.user.school_id
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member request not found."
      });
    }

    staff.role = role;
    staff.status = "Active";
    await staff.save();

    return res.status(200).json({
      success: true,
      message: `Staff member approved successfully as ${role}.`,
      user: {
        id: staff._id,
        full_name: staff.full_name,
        role: staff.role,
        status: staff.status
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve staff."
    });
  }
};

// ======================================================
// REJECT STAFF REQUEST
// ======================================================
exports.rejectStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const staff = await User.findOneAndDelete({
      _id: staff_id,
      school_id: req.user.school_id,
      status: "Pending"
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff request rejected and removed."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject request."
    });
  }
};

// ======================================================
// CREATE STAFF (MANUAL ADD BY PRINCIPAL)
// ======================================================
exports.createStaff = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone, password and role are required."
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
        message: "A user with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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

// ======================================================
// GET ALL ACTIVE SCHOOL STAFF
// ======================================================
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({
      school_id: req.user.school_id,
      role: { $in: STAFF_ROLES }
    })
      .select("-password")
      .sort({ created_at: -1 });

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

// ======================================================
// GET SINGLE STAFF MEMBER
// ======================================================
exports.getStaffMember = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      school_id: req.user.school_id,
      role: { $in: STAFF_ROLES }
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

// ======================================================
// UPDATE STAFF DETAILS
// ======================================================
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

// ======================================================
// SUSPEND STAFF
// ======================================================
exports.suspendStaff = async (req, res) => {
  try {
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

// ======================================================
// ACTIVATE STAFF
// ======================================================
exports.activateStaff = async (req, res) => {
  try {
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
