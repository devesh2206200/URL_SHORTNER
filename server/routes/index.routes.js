import express from "express";
import { createShortUrl, redirectToOriginalUrl, deleteUrl, updateUrl, generateQRCode } from "../controllers/url.controllers.js";
import { register, login, logout, refreshToken } from "../controllers/auth.controllers.js";
import { getUserUrls, deleteUserUrl, getUrlAnalytics } from "../controllers/user.controllers.js";
import { authMiddleware, requireAuth } from "../middleware/auth.middleware.js";
import { shortenLimiter, authLimiter } from "../middleware/rateLimiter.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { createUrlSchema } from "../validations/url.validation.js";

const router = express.Router();

// Auth
router.post("/api/auth/register", authLimiter, validate(registerSchema), register);
router.post("/api/auth/login",    authLimiter, validate(loginSchema), login);
router.post("/api/auth/logout",   requireAuth, logout);
router.post("/api/auth/refresh",  refreshToken);

// User
router.get("/api/user/urls",                        requireAuth, getUserUrls);
router.delete("/api/user/urls/:id",                 requireAuth, deleteUserUrl);
router.get("/api/user/urls/:shortUrlId/analytics",  requireAuth, getUrlAnalytics);

// URLs
router.post("/",                  authMiddleware, shortenLimiter, validate(createUrlSchema), createShortUrl);
router.put("/api/urls/:id",       requireAuth, updateUrl);
router.delete("/",                deleteUrl);
router.get("/api/urls/:shortUrlId/qr", generateQRCode);

// Health check
router.get("/", (req, res) => res.json({ success: true, message: "URL Shortener API Running 🚀" }));

// Redirect — keep LAST
router.get("/:shortUrlId", redirectToOriginalUrl);

export default router;