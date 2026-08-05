const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {

        // =============================
        // Get Authorization Header
        // =============================
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // =============================
        // Extract Token
        // =============================
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        // =============================
        // Verify Token
        // =============================
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save Logged-in User
        req.user = decoded;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
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
            message: "Authentication failed."
        });

    }
};

module.exports = authMiddleware;
