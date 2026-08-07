const Student = require("../models/student");

// =======================================
// Register Student (Pending Approval)
// =======================================
exports.registerStudent = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const student = await Student.create({
            school_id,
            admission_number: req.body.admission_number,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            other_name: req.body.other_name,
            gender: req.body.gender,
            date_of_birth: req.body.date_of_birth,
            class_name: req.body.class_name,
            arm: req.body.arm,
            home_address: req.body.home_address,
            medical_information: req.body.medical_information,
            passport: req.body.passport,
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Student registration submitted successfully.",
            student
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// =======================================
// Pending Students
// =======================================
exports.getPendingStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Pending"
        });

        res.json({
            success: true,
            students
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// =======================================
// Active Students
// =======================================
exports.getActiveStudents = async (req, res) => {
    try {
        const students = await Student.find({
            school_id: req.user.school_id,
            status: "Active"
        });

        res.json({
            success: true,
            students
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// =======================================
// Approve Student
// =======================================
exports.approveStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Active" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student approved successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Suspend Student
// =======================================
exports.suspendStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Suspended" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student suspended successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Reinstate Student
// =======================================
exports.reinstateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Active" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student reinstated successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Graduate Student
// =======================================
exports.graduateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Graduated" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student graduated successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================================
// Archive Student
// =======================================
exports.archiveStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id: req.user.school_id },
            { status: "Archived" },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        res.json({ success: true, message: "Student archived successfully.", student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
