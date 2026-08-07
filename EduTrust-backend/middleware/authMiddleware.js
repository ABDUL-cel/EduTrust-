
const jwt = require("jsonwebtoken");

// ==========================================
// JWT CONFIGURATION
// ==========================================
const JWT_SECRET =
    process.env.JWT_SECRET ||
    "edutrust_fallback_secret_key";


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authMiddleware = (req, res, next) => {
    try {

        // ==========================================
        // Get Authorization Header
        // ==========================================
        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message:
                    "Access denied. No token provided."
            });
        }


        // ==========================================
        // Extract Token
        // ==========================================
        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : authHeader;


        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Access denied. No authentication token."
            });
        }


        // ==========================================
        // Verify JWT
        // ==========================================
        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        // ==========================================
        // Validate User ID
        // ==========================================
        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token."
            });
        }


        // ==========================================
        // Save Logged-in User
        // ==========================================
        req.user = {
            id: decoded.id,

            school_id:
                decoded.school_id || null,

            role:
                decoded.role || null
        };


        // ==========================================
        // Continue
        // ==========================================
        next();

    } catch (error) {

        // ==========================================
        // Token Expired
        // ==========================================
        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Session expired. Please login again."
            });
        }


        // ==========================================
        // Invalid Token
        // ==========================================
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


        // ==========================================
        // General Authentication Error
        // ==========================================
        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Authentication failed."
        });
    }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = authMiddleware;
