import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import indexRouter from "./routes/index.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================
// Security & Logging
// ======================================

app.use(helmet());
app.use(morgan("dev"));

// ======================================
// CORS Configuration
// ======================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests like Postman or server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// ======================================
// Body Parser
// ======================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================
// Security
// ======================================

app.use(mongoSanitize());
app.use(cookieParser());

// ======================================
// Health Check
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "URL Shortener API is Running 🚀",
  });
});

app.get("/test", (req, res) => {
  res.send("Test Route");
});

// ======================================
// Routes
// ======================================

app.use("/", indexRouter);

// ======================================
// Error Handler
// ======================================

app.use(errorHandler);

// ======================================
// MongoDB
// ======================================

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