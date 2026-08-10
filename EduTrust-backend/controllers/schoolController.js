
const School = require("../models/school");

// =======================================
// Get Current School
// =======================================
exports.getCurrentSchool = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const school = await School.findById(school_id)
            .populate(
                "principal_id",
                "full_name email phone role status"
            );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found."
            });
        }

        return res.status(200).json({
            success: true,
            school
        });

    } catch (error) {
        console.error("GET CURRENT SCHOOL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Update Current School
// =======================================
exports.updateCurrentSchool = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "phone",
            "address",
            "school_type",
            "academic_session",
            "current_term",
            "motto",
            "website",
            "logo"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const school = await School.findByIdAndUpdate(
            req.user.school_id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "School information updated successfully.",
            school
        });

    } catch (error) {
        console.error("UPDATE SCHOOL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// GET SCHOOL BY SCHOOL CODE
// Public endpoint for parent registration
// ==========================================

const getSchoolByCode = async (req, res) => {
    try {
        const schoolCode = req.params.schoolCode
            ?.trim()
            .toUpperCase();

        if (!schoolCode) {
            return res.status(400).json({
                success: false,
                message: "School code is required."
            });
        }

        const school = await School.findOne({
            school_code: schoolCode,
            status: "Active"
        }).select(
            "name email phone address school_type academic_session current_term motto website logo school_code"
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found or inactive."
            });
        }

        return res.status(200).json({
            success: true,
            school
        });

    } catch (error) {
        console.error("Get school by code error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to find school."
        });
    }
};

module.exports = {
    getSchoolByCode
};
