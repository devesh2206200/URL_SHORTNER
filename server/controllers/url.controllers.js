import Url from "../models/Url.models.js";
import Visit from "../models/Visit.models.js";

import validateUrl from "../utils/validateUrl.js";
import generateUniqueId from "../utils/generateUniqueId.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import { UAParser } from "ua-parser-js";
import QRCode from "qrcode";
import { generateUrlInsights } from "../services/ai.service.js";

// =======================================
// Create Short URL
// =======================================
const createShortUrl = asyncHandler(async (req, res) => {
    const { url, customAlias, expiresAt } = req.body;

    const aiInsights = await generateUrlInsights(url);

    const clientUrl = process.env.BASE_URL || "http://localhost:5000";

    if (!validateUrl(url)) {
        throw new ApiError(400, "Invalid URL format");
    }

    let shortUrlId;

    // -------------------------------
    // Custom Alias
    // -------------------------------
    if (customAlias) {
        const cleanAlias = customAlias.trim();

        if (!/^[a-zA-Z0-9-_]+$/.test(cleanAlias)) {
            throw new ApiError(
                400,
                "Custom alias must contain only letters, numbers, hyphens and underscores."
            );
        }

        if (cleanAlias.length < 3 || cleanAlias.length > 30) {
            throw new ApiError(
                400,
                "Custom alias must be between 3 and 30 characters."
            );
        }

        const existingAlias = await Url.findOne({
            shortUrlId: cleanAlias,
        });

        const reservedAliases = [
            "api",
            "login",
            "register",
            "dashboard",
            "admin",
            "test",
        ];

        if (
            existingAlias ||
            reservedAliases.includes(cleanAlias.toLowerCase())
        ) {
            throw new ApiError(400, "Custom alias is already in use.");
        }

        shortUrlId = cleanAlias;
    } else {
        // -------------------------------
        // Existing Anonymous URL
        // -------------------------------
        if (!req.user && !expiresAt) {
            const existingUrl = await Url.findOne({
                url,
                userId: null,
                customAlias: null,
                expiresAt: null,
            });

            if (existingUrl) {
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            shortUrl: `${clientUrl}/${existingUrl.shortUrlId}`,
                            shortUrlId: existingUrl.shortUrlId,
                            clicks: existingUrl.clicks,
                        },
                        "URL already exists."
                    )
                );
            }
        }

        shortUrlId = await generateUniqueId();
    }

    // -------------------------------
    // Create URL
    // -------------------------------
    const newUrl = await Url.create({
        url,
        shortUrlId,
        userId: req.user ? req.user.id : null,
        customAlias: customAlias ? shortUrlId : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        date: new Date(),
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                shortUrl: `${clientUrl}/${newUrl.shortUrlId}`,
                shortUrlId: newUrl.shortUrlId,
                clicks: newUrl.clicks,
                aiInsights,
            },
            "Short URL created successfully."
        )
    );
});

// =======================================
// Redirect
// =======================================
const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    const { shortUrlId } = req.params;

    const urlDoc = await Url.findOne({ shortUrlId });

    if (!urlDoc) {
        return res
            .status(404)
            .send("<h1>404 Not Found</h1><p>The shortened URL was not found.</p>");
    }

    if (urlDoc.expiresAt && new Date() > urlDoc.expiresAt) {
        return res
            .status(410)
            .send("<h1>410 Gone</h1><p>This shortened link has expired.</p>");
    }

    const parser = new UAParser(req.headers["user-agent"] || "");
    const ua = parser.getResult();

    const browser = ua.browser.name || "Unknown";
    const os = ua.os.name || "Unknown";
    const deviceType = ua.device.type || "Desktop";

    const referrer =
        req.get("Referrer") ||
        req.get("Referer") ||
        "Direct";

    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "Unknown";

    await Visit.create({
        urlId: urlDoc._id,
        browser,
        os,
        deviceType:
            deviceType.charAt(0).toUpperCase() +
            deviceType.slice(1),
        referrer,
        ip,
    });

    await Url.findByIdAndUpdate(urlDoc._id, {
        $inc: {
            clicks: 1,
        },
    });

    return res.redirect(urlDoc.url);
});

// =======================================
// Delete URL
// =======================================
const deleteUrl = asyncHandler(async (req, res) => {
    const { url } = req.body;

    const urlDoc = await Url.findOne({ url });

    if (!urlDoc) {
        throw new ApiError(404, "URL not found.");
    }

    await Visit.deleteMany({
        urlId: urlDoc._id,
    });

    await Url.deleteOne({
        _id: urlDoc._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "URL and analytics deleted successfully."
        )
    );
});

// =======================================
// Update URL
// =======================================
const updateUrl = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { url } = req.body;

    if (!validateUrl(url)) {
        throw new ApiError(400, "Invalid URL.");
    }

    const urlDoc = await Url.findOne({
        _id: id,
        userId: req.user.id,
    });

    if (!urlDoc) {
        throw new ApiError(404, "URL not found.");
    }

    urlDoc.url = url;

    await urlDoc.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                id: urlDoc._id,
                shortUrlId: urlDoc.shortUrlId,
                url: urlDoc.url,
                clicks: urlDoc.clicks,
                expiresAt: urlDoc.expiresAt,
            },
            "URL updated successfully."
        )
    );
});

const generateQRCode = asyncHandler(async (req, res) => {
    const { shortUrlId } = req.params;

    const urlDoc = await Url.findOne({ shortUrlId });

    if (!urlDoc) {
        throw new ApiError(404, "URL not found.");
    }

    const shortUrl = `${process.env.BASE_URL}/${urlDoc.shortUrlId}`;

    const qrCode = await QRCode.toDataURL(shortUrl);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                shortUrl,
                qrCode,
            },
            "QR Code generated successfully."
        )
    );
});


export {
    createShortUrl,
    redirectToOriginalUrl,
    deleteUrl,
    updateUrl,
    generateQRCode,
};