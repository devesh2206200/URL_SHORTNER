import User from "../models/User.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const cookieOpts = { httpOnly: true, secure: false, sameSite: "lax" };

const makeTokens = (user) => ({
  accessToken: jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  refreshToken: jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }),
});

const sendTokens = (res, status, user, accessToken, refreshToken, message) =>
  res.status(status)
    .cookie("accessToken", accessToken, cookieOpts)
    .cookie("refreshToken", refreshToken, cookieOpts)
    .json(new ApiResponse(status, { user: { id: user._id, email: user.email }, accessToken }, message));

// Register
const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, "User already exists.");
  const user = await User.create({ email, password: await bcrypt.hash(password, 10) });
  const { accessToken, refreshToken } = makeTokens(user);
  user.refreshToken = refreshToken;
  await user.save();
  sendTokens(res, 201, user, accessToken, refreshToken, "User registered successfully.");
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, "Invalid credentials.");
  const { accessToken, refreshToken } = makeTokens(user);
  user.refreshToken = refreshToken;
  await user.save();
  sendTokens(res, 200, user, accessToken, refreshToken, "Login successful.");
});

// Logout
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
  res.clearCookie("accessToken", cookieOpts).clearCookie("refreshToken", cookieOpts)
    .status(200).json(new ApiResponse(200, null, "Logged out successfully."));
});

// Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided.");
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { throw new ApiError(401, "Invalid or expired refresh token."); }
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) throw new ApiError(401, "Refresh token revoked.");
  const { accessToken: newAccess, refreshToken: newRefresh } = makeTokens(user);
  user.refreshToken = newRefresh;
  await user.save();
  res.status(200).cookie("accessToken", newAccess, cookieOpts).cookie("refreshToken", newRefresh, cookieOpts)
    .json(new ApiResponse(200, { accessToken: newAccess }, "Token refreshed."));
});

export { register, login, logout, refreshToken };