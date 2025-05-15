"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const auth_service_1 = require("./auth.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const loginUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthServices.loginUser(req.body);
    res.cookie("token", result.token, { httpOnly: true });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});
const logoutUser = (0, catchAsync_1.default)(async (req, res) => {
    // Clear the token cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Successfully logged out",
        data: null,
    });
});
// get user profile
const getMyProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userToken = req.headers.authorization;
    const result = await auth_service_1.AuthServices.getMyProfile(userToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: "User profile retrieved successfully",
        data: result,
    });
});
// change password
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const userToken = req.headers.authorization;
    const { oldPassword, newPassword } = req.body;
    const result = await auth_service_1.AuthServices.changePassword(userToken, newPassword, oldPassword);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: "Password changed successfully",
        data: result,
    });
});
// forgot password
const forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthServices.forgotPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Check your email!",
        data: result
    });
});
const resendOtp = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthServices.resendOtp(req.body.email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Check your email!",
        data: result
    });
});
const verifyForgotPasswordOtp = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthServices.verifyForgotPasswordOtp(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Check your email!",
        data: result
    });
});
const resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    await auth_service_1.AuthServices.resetPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password Reset!",
        data: null
    });
});
exports.AuthController = {
    loginUser,
    logoutUser,
    getMyProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    resendOtp,
    verifyForgotPasswordOtp
};
