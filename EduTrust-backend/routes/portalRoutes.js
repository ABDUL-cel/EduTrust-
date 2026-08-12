// ============================================================
// backend/routes/portalRoutes.js
// ============================================================

const express = require("express");

const router = express.Router();


// ============================================================
// PARENT PORTAL
// ============================================================

router.get("/parent/login", (req, res) => {
    res.redirect("/parent-login.html");
});

router.get("/parent/dashboard", (req, res) => {
    res.redirect("/parent-dashboard.html");
});


// ============================================================
// STUDENT PORTAL
// ============================================================

router.get("/student/login", (req, res) => {
    res.redirect("/student-login.html");
});

router.get("/student/dashboard", (req, res) => {
    res.redirect("/student-dashboard.html");
});


// ============================================================
// STAFF PORTAL
// ============================================================

router.get("/staff/login", (req, res) => {
    res.redirect("/staff-login.html");
});

router.get("/staff/dashboard", (req, res) => {
    res.redirect("/staff-dashboard.html");
});


module.exports = router;
