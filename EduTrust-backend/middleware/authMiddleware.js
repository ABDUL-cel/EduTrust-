const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Student = require("../models/student");

const JWT_SECRET = process.env.JWT_SECRET || "edutrust_secret_key";

/* =========================================================
   ROLE AUTHORIZATION MIDDLEWARE
========================================================= */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: " You do not have permission to perform this action."
            });
        }

        const userRole = String(req.user.role).trim().toLowerCase();
        const allowed = allowedRoles.map(r => String(r).trim().toLowerCase());

        if (!allowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: " You do not have permission to perform this action."
            });
        }

        next();
    };
};

/* =========================================================
   SUPER ADMIN
========================================================= */
const protectAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized: Access token missing."
            });
        }

        const token = authHeader.substring(7).trim();
        const decoded = jwt.verify(token, JWT_SECRET);

        const admin = await Admin.findById(decoded.id)
            .select("-password")
            .lean();

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Not authorized: Admin user no longer exists."
            });
        }

        req.admin = admin;
        req.user = {
            ...admin,
            role: admin.role || "superadmin"
        };

        next();
    } catch (error) {
        console.error("JWT ADMIN AUTH ERROR:", error);
        return res.status(401).json({
            success: false,
            message: "Not authorized: Token failed or expired."
        });
    }
};

/* =========================================================
   NORMAL AUTH
========================================================= */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
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

        /* =================================================
           STUDENT TOKEN
        ================================================= */
        if (decoded.role === "student" || decoded.student_id) {
            const student = await Student.findById(
                decoded.id || decoded.student_id
            ).lean();

            if (!student) {
                return res.status(401).json({
                    success: false,
                    message: "Student account no longer exists."
                });
            }

            if (["Suspended", "Archived"].includes(student.status)) {
                return res.status(403).json({
                    success: false,
                    message: `Account is ${String(
                        student.status
                    ).toLowerCase()}. Access denied.`
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

        /* =================================================
           USER / SCHOOL ADMIN / STAFF / PARENT
        ================================================= */
        let user = await User.findById(decoded.id)
            .select("-password")
            .lean();

        /* =================================================
           ADMIN FALLBACK
        ================================================= */
        if (!user) {
            const admin = await Admin.findById(decoded.id)
                .select("-password")
                .lean();

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: "User account no longer exists."
                });
            }

            req.admin = admin;
            req.user = {
                ...admin,
                role: admin.role || "superadmin"
            };

            return next();
        }

        /* =================================================
           USER STATUS
        ================================================= */
        if (
            user.status &&
            String(user.status).trim().toLowerCase() !== "active"
        ) {
            return res.status(403).json({
                success: false,
                message: "This account is not active."
            });
        }

        /* =================================================
           SCHOOL CONNECTION
        ================================================= */
        const role = String(user.role || "").trim().toLowerCase();

        const isSystemAdmin = ["superadmin", "admin"].includes(role);

        if (!isSystemAdmin && !user.school_id) {
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
    authMiddleware,
    authorizeRoles
};
