const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "edutrust_fallback_secret_key";

const authMiddleware = async (
    req,
    res,
    next
) => {
    try {

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }

        const token =
            authHeader
                .substring(7)
                .trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token is missing."
            });
        }

        // ==================================================
        // VERIFY JWT
        // ==================================================

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        // ==================================================
        // LOAD USER FROM DATABASE
        // ==================================================

        const user =
            await User.findById(
                decoded.id
            )
                .select("-password")
                .lean();

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "User account no longer exists."
            });
        }

        // ==================================================
        // USER STATUS
        // ==================================================

        if (
            user.status !== "Active"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not active."
            });
        }

        // ==================================================
        // SCHOOL REQUIREMENT
        // ==================================================

        if (
            user.role !== "SuperAdmin" &&
            !user.school_id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is not connected to a school."
            });
        }

        // ==================================================
        // REQUEST USER
        // ==================================================

        req.user = user;

        next();

    } catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error
        );

        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token has expired."
            });
        }

        if (
            error.name ===
            "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token."
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Authentication error."
        });
    }
};

module.exports =
    authMiddleware;
