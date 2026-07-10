import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
    {
        shortUrlId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        url: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        customAlias: {
            type: String,
            default: null,
            index: true,
            trim: true,
        },

        clicks: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Url = mongoose.model("Url", urlSchema);

export default Url;