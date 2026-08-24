const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const School = require("../models/school");
const User = require("../models/User");
const Admin = require('../models/Admin');
/**
 * Generate signed JWT Token helper containing user roles
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id || user.id,
            role: user.role || "SuperAdmin",
            school_id: user.school_id || null
        }, 
        process.env.JWT_SECRET || "edutrust_secret_key", 
        { expiresIn: "1d" }
    );

};

/**
 * @desc    Super Admin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both username and password.'
            });
        }

        // Find admin and explicitly include hidden password field for validation
        const admin = await Admin.findOne({ 
            $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }] 
        }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials.'
            });
        }

        // Verify password
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials.'
            });
        }
// Inside loginAdmin:
const token = generateToken(admin);

        res.status(200).json({
            success: true,
            message: 'Admin login successful.',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login processing.'
        });
    }
};

/**
 * @desc    Initial Seeder to create default Super Admin if none exists
 * @route   POST /api/admin/seed
 * @access  Public (Should be disabled after setup)
 */
exports.seedSuperAdmin = async (req, res) => {
    try {
        const count = await Admin.countDocuments();
        if (count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Admin user already exists. Seeding aborted.'
            });
        }

        const admin = await Admin.create({
            username: req.body.username || 'superadmin',
            email: req.body.email || 'admin@edutrust.com',
            password: req.body.password || 'EduTrust@2026Secret',
            role: 'Super Admin'
        });

        res.status(201).json({
            success: true,
            message: 'Initial Super Admin account created successfully.',
            username: admin.username
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const JWT_SECRET = process.env.JWT_SECRET || "edutrust_fallback_secret_key";

// ======================================================
// HELPER FUNCTIONS: SCHOOL CODE
// ======================================================

function generateSchoolCode(schoolName) {
  const prefix = String(schoolName || "SCHOOL")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 5)
    .toUpperCase()
    .padEnd(3, "X");

  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomNumber}`;
}

async function createUniqueSchoolCode(schoolName) {
  let schoolCode;
  let exists = true;

  while (exists) {
    schoolCode = generateSchoolCode(schoolName);
    exists = await School.exists({ school_code: schoolCode });
  }

  return schoolCode;
}

// ======================================================
// REGISTER SCHOOL + PRINCIPAL
// ======================================================

exports.registerSchool = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    // 1. Validation
    if (
      !school_name ||
      !school_email ||
      !principal_name ||
      !principal_email ||
      !password
    ) {
      await session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "School name, school email, principal name, principal email, and password are required."
      });
    }

    if (String(password).length < 6) {
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    // 2. Normalization
    const schoolName = String(school_name).trim();
    const schoolEmail = String(school_email).trim().toLowerCase();
    const principalName = String(principal_name).trim();
    const principalEmail = String(principal_email).trim().toLowerCase();

    // 3. Duplicate Checks
    const existingSchool = await School.findOne({ email: schoolEmail }).session(session);
    if (existingSchool) {
      await session.endSession();
      return res.status(409).json({
        success: false,
        message: "A school with this email already exists."
      });
    }

    const existingUser = await User.findOne({ email: principalEmail }).session(session);
    if (existingUser) {
      await session.endSession();
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // 4. Generate Code & Hash Password
    const schoolCode = await createUniqueSchoolCode(schoolName);
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create School
    const [school] = await School.create(
      [
        {
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
          school_code: schoolCode,
          status: "Active"
        }
      ],
      { session }
    );

    // 6. Create Principal User
    const nameParts = principalName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const [user] = await User.create(
      [
        {
          first_name: firstName,
          last_name: lastName,
          full_name: principalName,
          email: principalEmail,
          phone: phone || "",
          password: hashedPassword,
          role: "Principal",
          status: "Active",
          school_id: school._id
        }
      ],
      { session }
    );

    // 7. Link Principal back to School
    school.principal_id = user._id;
    await school.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "School registered successfully.",
      school: {
        id: school._id,
        name: school.name,
        email: school.email,
        school_code: school.school_code,
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
    await session.abortTransaction();
    session.endSession();

    console.error("REGISTER SCHOOL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "School registration failed."
    });
  }
};

// ======================================================
// PRINCIPAL / SCHOOL LOGIN
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

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Find User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 2. Role Validation
    if (user.role !== "Principal" && user.role !== "SuperAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only Principal accounts can use the School Portal login."
      });
    }

    // 3. Status Check
    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active."
      });
    }

    // 4. Password Check
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 5. Load Associated School
    let school = null;
    if (user.school_id) {
      school = await School.findById(user.school_id).lean();
    }

    if (user.role !== "SuperAdmin" && !school) {
      return res.status(403).json({
        success: false,
        message: "This account is not connected to a valid school."
      });
    }

    if (school && school.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "This school account is not active."
      });
    }

    // 6. JWT Generation
    const token = jwt.sign(
      {
        id: user._id,
        school_id: user.school_id,
        role: user.role,
        parent_id: user.parent_id,
        student_id: user.student_id,
        teacher_id: user.teacher_id,
        staff_id: user.staff_id
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7. Response
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
        parent_id: user.parent_id,
        student_id: user.student_id,
        teacher_id: user.teacher_id,
        staff_id: user.staff_id
      },
      school: school
        ? {
            id: school._id,
            name: school.name,
            email: school.email,
            school_code: school.school_code,
            phone: school.phone,
            address: school.address,
            school_type: school.school_type,
            academic_session: school.academic_session,
            current_term: school.current_term,
            motto: school.motto,
            website: school.website,
            logo: school.logo,
            status: school.status
          }
        : null
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
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    let school = null;
    if (user.school_id) {
      school = await School.findById(user.school_id).lean();
    }

    return res.status(200).json({
      success: true,
      user,
      school
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load profile."
    });
  }
};
