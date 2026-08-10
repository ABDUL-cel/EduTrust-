const Class = require("../models/class");
const Subject = require("../models/subject");
const User = require("../models/User");

exports.createClass = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const existingClass = await Class.findOne({
            school_id,
            name: req.body.name,
            arm: req.body.arm || "",
            status: "Active"
        });

        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "This class already exists."
            });
        }

        const newClass = await Class.create({
            school_id,
            name: req.body.name,
            arm: req.body.arm || "",
            class_teacher_id: req.body.class_teacher_id || null,
            subjects: req.body.subjects || []
        });

        const populatedClass = await Class.findById(
            newClass._id
        )
            .populate(
                "class_teacher_id",
                "full_name email role"
            )
            .populate(
                "subjects",
                "name code"
            );

        res.status(201).json({
            success: true,
            message: "Class created successfully.",
            class: populatedClass
        });
    } catch (error) {
        console.error("CREATE CLASS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find({
            school_id: req.user.school_id,
            status: "Active"
        })
            .populate(
                "class_teacher_id",
                "full_name email role"
            )
            .populate(
                "subjects",
                "name code"
            )
            .sort({
                name: 1,
                arm: 1
            });

        res.json({
            success: true,
            count: classes.length,
            classes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        if (req.body.class_teacher_id) {
            const teacher = await User.findOne({
                _id: req.body.class_teacher_id,
                school_id,
                role: "Teacher",
                status: "Active"
            });

            if (!teacher) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected class teacher is not a valid active teacher."
                });
            }
        }

        if (req.body.subjects) {
            const validSubjects = await Subject.countDocuments({
                _id: {
                    $in: req.body.subjects
                },
                school_id,
                status: "Active"
            });

            if (
                validSubjects !==
                req.body.subjects.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more subjects do not belong to this school."
                });
            }
        }

        const updatedClass =
            await Class.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    name: req.body.name,
                    arm: req.body.arm || "",
                    class_teacher_id:
                        req.body.class_teacher_id ||
                        null,
                    subjects:
                        req.body.subjects || []
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "class_teacher_id",
                    "full_name email role"
                )
                .populate(
                    "subjects",
                    "name code"
                );

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found."
            });
        }

        res.json({
            success: true,
            message: "Class updated successfully.",
            class: updatedClass
        });
    } catch (error) {
        console.error("UPDATE CLASS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.archiveClass = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const classItem =
            await Class.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school_id
                },
                {
                    status: "Archived"
                },
                {
                    new: true
                }
            );

        if (!classItem) {
            return res.status(404).json({
                success: false,
                message: "Class not found."
            });
        }

        res.json({
            success: true,
            message: "Class archived successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// =======================================
// Get Classes Assigned To Current Teacher
// =======================================
exports.getMyClasses = async (req, res) => {
    try {
        const classes = await Class.find({
            school_id: req.user.school_id,
            class_teacher_id: req.user._id,
            status: "Active"
        })
            .populate("subjects", "name code")
            .sort({
                name: 1,
                arm: 1
            });

        return res.json({
            success: true,
            count: classes.length,
            classes
        });

    } catch (error) {
        console.error("GET MY CLASSES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get One Teacher Class
// =======================================
exports.getMyClass = async (req, res) => {
    try {
        const classItem = await Class.findOne({
            _id: req.params.id,
            school_id: req.user.school_id,
            class_teacher_id: req.user._id,
            status: "Active"
        })
            .populate("subjects", "name code");

        if (!classItem) {
            return res.status(404).json({
                success: false,
                message:
                    "Class not found or you are not assigned to this class."
            });
        }

        return res.json({
            success: true,
            class: classItem
        });

    } catch (error) {
        console.error("GET MY CLASS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
