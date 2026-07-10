import Url from "../models/Url.models.js";
import Visit from "../models/Visit.models.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// Get Logged In User URLs
// ==========================================

const getUserUrls = asyncHandler(async (req, res) => {
    const urls = await Url.find({
        userId: req.user.id,
    }).sort({
        createdAt: -1,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            urls,
            "URLs fetched successfully."
        )
    );
});

// ==========================================
// Delete User URL
// ==========================================

const deleteUserUrl = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const urlDoc = await Url.findOne({
        _id: id,
        userId: req.user.id,
    });

    if (!urlDoc) {
        throw new ApiError(
            404,
            "URL not found or unauthorized."
        );
    }

    await Visit.deleteMany({
        urlId: urlDoc._id,
    });

    await Url.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "URL deleted successfully."
        )
    );
});

// ==========================================
// URL Analytics
// ==========================================

const getUrlAnalytics = asyncHandler(async (req, res) => {
    const { shortUrlId } = req.params;

    const urlDoc = await Url.findOne({
        shortUrlId,
        userId: req.user.id,
    });

    if (!urlDoc) {
        throw new ApiError(
            404,
            "URL not found or unauthorized."
        );
    }

    const visits = await Visit.find({
        urlId: urlDoc._id,
    }).sort({
        timestamp: -1,
    });

    const browsers = {};
    const os = {};
    const referrers = {};
    const timeline = {};

    visits.forEach((visit) => {
        browsers[visit.browser] =
            (browsers[visit.browser] || 0) + 1;

        os[visit.os] =
            (os[visit.os] || 0) + 1;

        let refHost = "Direct";

        if (visit.referrer !== "Direct") {
            try {
                refHost = new URL(visit.referrer).hostname;
            } catch {
                refHost = "Unknown";
            }
        }

        referrers[refHost] =
            (referrers[refHost] || 0) + 1;

        const dateKey = visit.timestamp
            .toISOString()
            .split("T")[0];

        timeline[dateKey] =
            (timeline[dateKey] || 0) + 1;
    });

    const browserStats = Object.entries(browsers)
        .map(([name, count]) => ({
            name,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    const osStats = Object.entries(os)
        .map(([name, count]) => ({
            name,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    const referrerStats = Object.entries(referrers)
        .map(([name, count]) => ({
            name,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    const timelineStats = Object.entries(timeline)
        .map(([date, clicks]) => ({
            date,
            clicks,
        }))
        .sort(
            (a, b) =>
                new Date(a.date) - new Date(b.date)
        )
        .slice(-30);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                url: urlDoc.url,
                shortUrlId: urlDoc.shortUrlId,
                clicks: urlDoc.clicks,
                createdAt: urlDoc.createdAt,
                expiresAt: urlDoc.expiresAt,
                analytics: {
                    totalClicks: visits.length,
                    browsers: browserStats,
                    os: osStats,
                    referrers: referrerStats,
                    timeline: timelineStats,
                },
            },
            "Analytics fetched successfully."
        )
    );
});

export {
    getUserUrls,
    deleteUserUrl,
    getUrlAnalytics,
};