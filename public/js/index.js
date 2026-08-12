// routes/index.js
// If you already mount routes elsewhere,
// only make sure these two routes are mounted.

const express = require("express");

const router = express.Router();

const parentRoutes =
    require("./parentRoutes");

const studentRoutes =
    require("./studentRoutes");


router.use(
    "/parent",
    parentRoutes
);


router.use(
    "/student",
    studentRoutes
);


module.exports = router;
