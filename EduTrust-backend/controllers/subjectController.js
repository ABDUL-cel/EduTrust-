const Subject = require("../models/subject");

exports.createSubject = async (req, res) => {
    try {
        const subject = await Subject.create({
            school_id: req.user.school_id,
            name: req.body.name,
            code: req.body.code,
            description: req.body.description || ""
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully.",
            subject
        });
    } catch (error) {
        console.error("CREATE SUBJECT ERROR:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "A subject with this code already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({
            school_id: req.user.school_id,
            status: "Active"
        }).sort({ name: 1 });

        res.json({
            success: true,
            count: subjects.length,
            subjects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                name: req.body.name,
                code: req.body.code,
                description: req.body.description || ""
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found."
            });
        }

        res.json({
            success: true,
            message: "Subject updated successfully.",
            subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.archiveSubject = async (req, res) => {
    try {
        const subject = await Subject.findOneAndUpdate(
            {
                _id: req.params.id,
                school_id: req.user.school_id
            },
            {
                status: "Archived"
            },
            {
                new: true
            }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found."
            });
        }

        res.json({
            success: true,
            message: "Subject archived successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
