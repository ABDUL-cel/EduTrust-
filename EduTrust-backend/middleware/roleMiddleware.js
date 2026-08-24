// roleMiddleware.js

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {

        const rawRole =
            req.user?.role ||
            req.admin?.role ||
            "";

        const userRole =
            String(rawRole)
                .trim()
                .toLowerCase();

        const normalizedAllowed =
            allowedRoles.map(role =>
                String(role)
                    .trim()
                    .toLowerCase()
            );

        if (
            !userRole ||
            !normalizedAllowed.includes(userRole)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
