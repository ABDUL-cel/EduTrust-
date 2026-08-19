const School = require("../models/school"); // Fixed casing for Render Linux hosting

// =======================================
// GET CURRENT SCHOOL
// =======================================
exports.getCurrentSchool = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School account could not be identified."
            });
        }

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
            message: "Server error while fetching current school details."
        });
    }
};

// =======================================
// UPDATE CURRENT SCHOOL
// =======================================
exports.updateCurrentSchool = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized: Missing school identifier."
            });
        }

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
            school_id,
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

// =======================================
// PUBLIC SCHOOL SEARCH
// =======================================
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
            name: {
                $regex: search,
                $options: "i"
            }
        })
            .select("_id name email address school_type logo website school_code")
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
