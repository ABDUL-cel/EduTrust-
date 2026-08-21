const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Student = require("../models/student");

// Standardized fallback key across controllers and middleware
const JWT_SECRET = process.env.JWT_SECRET || "edutrust_secret_key";

/**
 * Super Admin Middleware: Verifies admin tokens against Admin collection
 */
const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized: Admin user no longer exists.'
                });
            }

            return next();
        } catch (error) {
            console.error('JWT Admin Auth Verification Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized: Token failed or expired.'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized: Access token missing.'
        });
    }
};

/**
 * Standard User Middleware: Verifies tokens against User or Student collections
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // 1. Check if token belongs to a Student account
        if (decoded.role === "student" || decoded.student_id) {
            const student = await Student.findById(decoded.id || decoded.student_id).lean();

            if (!student) {
                return res.status(401).json({
                    success: false,
                    message: "Student account no longer exists."
                });
            }

            if (student.status === "Suspended" || student.status === "Archived") {
                return res.status(403).json({
                    success: false,
                    message: `Account is ${student.status.toLowerCase()}. Access denied.`
                });
            }

            req.user = {
                id: student._id,
                _id: student._id,
                student_id: student._id,
                school_id: student.school_id,
                role: "student",
                first_name: student.first_name,
                last_name: student.last_name
            };

            return next();
        }

        // 2. Otherwise check User collection (Staff/Admin/Parent)
        const user = await User.findById(decoded.id).select("-password").lean();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists."
            });
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "This account is not active."
            });
        }

        if (user.role !== "SuperAdmin" && !user.school_id) {
            return res.status(403).json({
                success: false,
                message: "This account is not connected to a school."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Authentication token has expired."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication error."
        });
    }
};

module.exports = {
    protectAdmin,
    authMiddleware
};
