const Parent = require("../models/Parent");
const User = require("../models/User");

/* ==========================================================================
   1. REGISTER / CREATE PARENT
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
      status,
      school_id
    } = req.body;

    // Determine school_id: from logged-in Principal/User or req.body
    let targetSchoolId = school_id;
    if (!targetSchoolId && req.user) {
      const user = await User.findById(req.user.id || req.user._id);
      targetSchoolId = user?.school_id || user?.schoolId;
    }

    if (!targetSchoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required to register a parent."
      });
    }

    // Required fields validation based on Parent schema
    if (!first_name || !last_name || !relationship || !phone) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, relationship, and phone are required."
      });
    }

    // Optional check: Duplicate parent by phone within the same school
    const existingParent = await Parent.findOne({ school_id: targetSchoolId, phone });
    if (existingParent) {
      return res.status(400).json({
        success: false,
        message: "A parent with this phone number already exists in this school."
      });
    }

    // Create Parent record matching ParentSchema exactly
    const newParent = await Parent.create({
      school_id: targetSchoolId,
      first_name,
      last_name,
      other_name: other_name || "",
      relationship,
      email: email ? email.toLowerCase() : "",
      phone,
      alternate_phone: alternate_phone || "",
      home_address: home_address || "",
      occupation: occupation || "",
      passport: passport || "",
      status: status || "Active"
    });

    return res.status(201).json({
      success: true,
      message: "Parent created successfully.",
      parent: newParent
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

/* ==========================================================================
   2. PARENT LOGIN (Fallback handler for route export compatibility)
   ========================================================================== */
const loginParent = async (req, res) => {
  try {
    const { phone, email } = req.body;

    const parent = await Parent.findOne({
      $or: [{ phone }, { email: email ? email.toLowerCase() : null }]
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent account not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parent located.",
      parent
    });
  } catch (error) {
    console.error("PARENT LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login query failed.",
      error: error.message
    });
  }
};

/* ==========================================================================
   3. GET PARENT PROFILE
   ========================================================================== */
const getParentProfile = async (req, res) => {
  try {
    const parentId = req.user?.id || req.user?._id;
    if (!parentId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const parent = await Parent.findById(parentId).lean();
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found." });
    }

    return res.status(200).json({ success: true, parent });
  } catch (error) {
    console.error("GET PARENT PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
      error: error.message
    });
  }
};

/* ==========================================================================
   4. GET ALL PARENTS (For Logged-in Principal's School)
   ========================================================================== */
const getParents = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const principal = await User.findById(userId);
    if (!principal) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const schoolId = principal.school_id || principal.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "Your account is not connected to a school."
      });
    }

    const parents = await Parent.find({ school_id: schoolId })
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({ success: true, count: parents.length, parents });
  } catch (error) {
    console.error("GET PARENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load parents.",
      error: error.message
    });
  }
};

/* ==========================================================================
   5. GET ONE PARENT BY ID
   ========================================================================== */
const getParentById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const parentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const principal = await User.findById(userId);
    if (!principal) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const schoolId = principal.school_id || principal.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "Your account is not connected to a school."
      });
    }

    const parent = await Parent.findOne({ _id: parentId, school_id: schoolId }).lean();

    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found." });
    }

    return res.status(200).json({ success: true, parent });
  } catch (error) {
    console.error("GET PARENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load parent.",
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
  getParentById
};
