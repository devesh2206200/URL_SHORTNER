import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
    {
        urlId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Url",
            required: true,
            index: true,
        },

        browser: {
            type: String,
            default: "Unknown",
        },

        os: {
            type: String,
            default: "Unknown",
        },

        deviceType: {
            type: String,
            default: "Desktop",
        },

        referrer: {
            type: String,
            default: "Direct",
        },

        ip: {
            type: String,
            default: "Unknown",
        },

        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

visitSchema.index({
    urlId: 1,
    timestamp: -1,
});

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;