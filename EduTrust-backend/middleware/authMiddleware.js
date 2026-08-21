const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Student = require("../models/student");

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

            const admin = await Admin.findById(decoded.id).select('-password').lean();

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized: Admin user no longer exists.'
                });
            }

            req.admin = admin;
            req.user = {
                ...admin,
                role: admin.role || "superadmin"
            };

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
 * Standard User Middleware: Verifies tokens against Student, User, or Admin collections
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

        // 1. Check if Student token
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

        // 2. Check User collection (Staff / SchoolAdmin / Parent / Admin)
        let user = await User.findById(decoded.id).select("-password").lean();

        // 3. Fallback check for Admin collection if not found in User collection
        if (!user) {
            const admin = await Admin.findById(decoded.id).select("-password").lean();
            if (admin) {
                req.user = {
                    ...admin,
                    role: admin.role || "superadmin"
                };
                req.admin = admin;
                return next();
            }

            return res.status(401).json({
                success: false,
                message: "User account no longer exists."
            });
        }

        if (user.status && user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "This account is not active."
            });
        }

        const userRoleLower = (user.role || "").toLowerCase();
        if (userRoleLower !== "superadmin" && userRoleLower !== "admin" && !user.school_id) {
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

/**
 * Role-Based Authorization Middleware
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const rawRole = req.user?.role || req.admin?.role || "";
        const userRole = String(rawRole).toLowerCase().trim();
        const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase().trim());

        if (!userRole || !normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = {
    protectAdmin,
    authMiddleware,
    authorizeRoles
};
