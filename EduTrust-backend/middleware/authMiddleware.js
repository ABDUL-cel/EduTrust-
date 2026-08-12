const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
    process.env.JWT_SECRET || "edutrust_fallback_secret_key";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id)
            .select("-password")
            .lean();

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

        // --------------------------------------------------
        // IMPORTANT:
        // school_id must come from the User account.
        // Do NOT replace it with user._id.
        // --------------------------------------------------

        req.user = {
            id: user._id,
            role: user.role,
            school_id: user.school_id,
            parent_id: user.parent_id,
            student_id: user.student_id,
            teacher_id: user.teacher_id,
            staff_id: user.staff_id
        };

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

module.exports = authMiddleware;
