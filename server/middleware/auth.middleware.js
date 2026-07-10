import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authMiddleware = (req, res, next) => {
    console.log("=================================");
    console.log("Authorization Header:", req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        console.log("❌ No Bearer Token");
        req.user = null;
        return next();
    }

    const token = authHeader.split(" ")[1];

    console.log("Received Token:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("✅ Token Verified");
        console.log(decoded);

        req.user = decoded;
        next();
    } catch (err) {
        console.log("❌ JWT ERROR:", err.message);

        req.user = null;
        next();
    }
};

const requireAuth = (req, res, next) => {
    authMiddleware(req, res, () => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized"));
        }

        next();
    });
};

export { authMiddleware, requireAuth };