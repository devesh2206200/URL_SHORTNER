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

// ==============================
// Middlewares
// ==============================

app.use(helmet());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());

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
        console.log(" MongoDB Connected");

        app.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(" Database Connection Failed");
        console.error(err.message);
    });