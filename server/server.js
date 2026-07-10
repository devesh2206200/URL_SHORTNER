import dotenv from "dotenv";
dotenv.config();

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY);
console.log("ENV Loaded:");
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

const PORT = process.env.PORT || 5000;

// ==============================
// Middlewares
// ==============================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ==============================
// Test Route
// ==============================

app.get("/test", (req, res) => {
    res.send("Test Route");
});




// ==============================
// Routes
// ==============================

app.use("/", indexRouter);

// ==============================
// Global Error Handler
// ==============================

app.use(errorHandler);

// ==============================
// Database Connection
// ==============================

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("✅ MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
    });