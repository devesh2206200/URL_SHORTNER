import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
        },
        refreshToken: {
        type: String,
        default: "",
},
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;