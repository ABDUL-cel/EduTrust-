const Parent = require("../models/Parent");
const User = require("../models/User");

/*
==================================================
GET ALL PARENTS FOR LOGGED-IN PRINCIPAL'S SCHOOL
==================================================
*/
const getParents = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const principal = await User.findById(userId);

        if (!principal) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        /*
        ------------------------------------------
        Find the school belonging to this user.
        ------------------------------------------
        */
        const schoolId =
            principal.school_id ||
            principal.schoolId;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        /*
        ------------------------------------------
        Only return parents belonging to this
        school.
        ------------------------------------------
        */
        const parents = await Parent.find({
            school_id: schoolId
        })
            .sort({
                created_at: -1
            })
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


/*
==================================================
GET ONE PARENT
==================================================
*/
const getParentById = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const parentId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const principal = await User.findById(userId);

        if (!principal) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const schoolId =
            principal.school_id ||
            principal.schoolId;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        /*
        IMPORTANT:
        The parent must belong to the same school
        as the logged-in principal.
        */
        const parent = await Parent.findOne({
            _id: parentId,
            school_id: schoolId
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


/*
==================================================
EXPORTS
==================================================
*/
module.exports = {
    getParents,
    getParentById
};
