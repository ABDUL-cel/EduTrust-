
const School = require("../models/school");

// =======================================
// Get My School Profile
// =======================================
exports.getMySchool = async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "School account is not linked to a school."
            });
        }

        const school = await School.findById(schoolId);

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
        console.error("GET SCHOOL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error retrieving school profile."
        });
    }
};


// =======================================
// Update My School Profile
// =======================================
exports.updateMySchool = async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "School account is not linked to a school."
            });
        }

        const allowedFields = [
            "name",
            "email",
            "phone",
            "address",
            "school_type",
            "academic_session",
            "current_term",
            "motto",
            "website",
            "logo",
            "principal_name",
            "principal_email"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const school = await School.findByIdAndUpdate(
            schoolId,
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
            message: "School profile updated successfully.",
            school
        });

    } catch (error) {
        console.error("UPDATE SCHOOL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error updating school profile."
        });
    }
};
