// middleware/roleMiddleware.js

/**
 * Middleware to restrict route access based on user roles
 * Usage in routes: roleMiddleware("Principal", "SuperAdmin")
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Ensure user is authenticated (populated by authMiddleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing user authentication details."
      });
    }

    // 2. Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized.`
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
