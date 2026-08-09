const express = require("express");

const router = express.Router();

const {
    getParents,
    getParentById
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
PARENT MANAGEMENT ROUTES
==================================================
*/

/*
GET /api/parents

Returns parents belonging ONLY to the
logged-in principal's school.
*/
router.get(
    "/",
    authMiddleware,
    getParents
);


/*
GET /api/parents/:id

Returns one parent belonging ONLY to the
logged-in principal's school.
*/
router.get(
    "/:id",
    authMiddleware,
    getParentById
);


module.exports = router;
