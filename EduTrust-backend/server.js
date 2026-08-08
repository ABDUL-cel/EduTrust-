require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Database Connection
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const parentRoutes = require("./routes/parentRoutes");
const staffRoutes = require("./routes/staffRoutes");
// Future routes
const studentRoutes = require("./routes/studentRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const feeRoutes = require("./routes/feeRoutes");
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// Middleware
app.use(express.json());

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

// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 EduTrust Backend API is running successfully."
    });
});

// Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/staff", staffRoutes);
// Future Routes
app.use("/api/students", studentRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/fees", feeRoutes);
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
