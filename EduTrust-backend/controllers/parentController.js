const mongoose = require("mongoose");
const Parent = require("../models/Parent");
const Student = require("../models/student");

function getSchoolId(req) {
    return (
        req.user?.school_id ||
        req.user?.schoolId ||
        req.user?.school
    );
}

/*
========================================
CREATE PARENT
POST /api/parents
========================================
*/
const createParent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School information was not found for this account."
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

        if (
            !first_name ||
            !last_name ||
            !relationship ||
            !phone
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship and phone are required."
            });
        }

        const parent = await Parent.create({
            school_id,
            first_name,
            last_name,
            other_name: other_name || "",
            relationship,
            email: email || "",
            phone,
            alternate_phone: alternate_phone || "",
            home_address: home_address || "",
            occupation: occupation || "",
            passport: passport || ""
        });

        return res.status(201).json({
            success: true,
            message: "Parent registered successfully.",
            parent
        });
    } catch (error) {
        console.error("CREATE PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to register parent.",
            error: error.message
        });
    }
};

/*
========================================
GET ALL PARENTS
GET /api/parents
========================================
*/
const getParents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School information was not found."
            });
        }

        const parents = await Parent.find({ school_id })
            .sort({ created_at: -1 })
            .lean();

        const parentIds = parents.map(parent => parent._id);

        const students = await Student.find({
            school_id,
            parent_id: { $in: parentIds }
        })
            .select(
                "parent_id admission_number first_name last_name class_name arm status"
            )
            .lean();

        const studentsByParent = {};

        students.forEach(student => {
            const key = student.parent_id.toString();

            if (!studentsByParent[key]) {
                studentsByParent[key] = [];
            }

            studentsByParent[key].push(student);
        });

        const result = parents.map(parent => ({
            ...parent,
            students: studentsByParent[parent._id.toString()] || []
        }));

        return res.status(200).json({
            success: true,
            count: result.length,
            parents: result
        });
    } catch (error) {
        console.error("GET PARENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load parents.",
            error: error.message
        });
    }
};

/*
========================================
GET SINGLE PARENT
GET /api/parents/:id
========================================
*/
const getParentById = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const { id } = req.params;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School information was not found."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID."
            });
        }

        const parent = await Parent.findOne({
            _id: id,
            school_id
        }).lean();

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        const students = await Student.find({
            school_id,
            parent_id: parent._id
        })
            .select(
                "admission_number first_name last_name other_name class_name arm gender status"
            )
            .lean();

        return res.status(200).json({
            success: true,
            parent: {
                ...parent,
                students
            }
        });
    } catch (error) {
        console.error("GET PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load parent.",
            error: error.message
        });
    }
};

/*
========================================
UPDATE PARENT
PUT /api/parents/:id
========================================
*/
const updateParent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const { id } = req.params;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School information was not found."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID."
            });
        }

        const allowedFields = [
            "first_name",
            "last_name",
            "other_name",
            "relationship",
            "email",
            "phone",
            "alternate_phone",
            "home_address",
            "occupation",
            "passport",
            "status"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const parent = await Parent.findOneAndUpdate(
            {
                _id: id,
                school_id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent updated successfully.",
            parent
        });
    } catch (error) {
        console.error("UPDATE PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update parent.",
            error: error.message
        });
    }
};

/*
========================================
DELETE PARENT
DELETE /api/parents/:id
========================================
*/
const deleteParent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const { id } = req.params;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School information was not found."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID."
            });
        }

        const parent = await Parent.findOneAndDelete({
            _id: id,
            school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        // Remove the parent relationship from students.
        await Student.updateMany(
            {
                school_id,
                parent_id: parent._id
            },
            {
                $set: {
                    parent_id: null
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Parent deleted successfully."
        });
    } catch (error) {
        console.error("DELETE PARENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete parent.",
            error: error.message
        });
    }
};

/*
========================================
LINK STUDENT TO PARENT
PUT /api/parents/:parentId/students/:studentId
========================================
*/
const linkStudentToParent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const { parentId, studentId } = req.params;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School information was not found."
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(parentId) ||
            !mongoose.Types.ObjectId.isValid(studentId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent or student ID."
            });
        }

        const parent = await Parent.findOne({
            _id: parentId,
            school_id
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found."
            });
        }

        const student = await Student.findOne({
            _id: studentId,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        student.parent_id = parent._id;
        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student linked to parent successfully.",
            student
        });
    } catch (error) {
        console.error("LINK STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to link student to parent.",
            error: error.message
        });
    }
};

module.exports = {
    createParent,
    getParents,
    getParentById,
    updateParent,
    deleteParent,
    linkStudentToParent
};
