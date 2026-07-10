import rateLimit from "express-rate-limit";

const shortenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: "Too many requests. Try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: {
        success: false,
        message: "Too many authentication attempts.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export {
    shortenLimiter,
    authLimiter,
};