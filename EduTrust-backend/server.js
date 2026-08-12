require("dotenv").config();

const express = require("express");
const path = require("path"); // <--- Re-added path here
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// Database Connection
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const parentRoutes = require("./routes/parentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const classRoutes = require("./routes/classRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const assessmentStructureRoutes = require("./routes/assessmentStructureRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resultRoutes = require('./routes/resultRoutes');

const app = express();

app.set("trust proxy", 1);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
                imgSrc: ["'self'", "data:", "https:", "blob:"],
                connectSrc: [
                    "'self'",
                    "https://edutrust-15ii.onrender.com",
                    "http://localhost:5000",
                    "http://localhost:5500",
                    "http://127.0.0.1:5500"
                ],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// If you want to serve static files from a 'public' folder:
app.use(express.static(path.join(__dirname, "public")));

app.use(
    mongoSanitize({
        replaceWith: "_"
    })
);

app.use(
    cors({
        origin: [
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "https://abdul-cel.github.io",
            "https://edutrust-15ii.onrender.com"
        ],
        credentials: true
    })
);

const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again after 15 minutes."
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login/auth attempts. Please wait 15 minutes."
    }
});

app.use("/api", globalApiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/parents/login", authLimiter);

// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 EduTrust Backend API is running successfully."
    });
});

// Authentication & Core Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assessment-structures", assessmentStructureRoutes);
app.use("/api/students", studentRoutes);
app.use('/api/results', resultRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Connect to Database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 EduTrust Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to database:", err);
});
