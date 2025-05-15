"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailSender = async (email, html, subject) => {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.titan.email",
        port: 465,
        secure: true,
        auth: {
            user: "pixelteam@smtech24.com",
            pass: "@pixel321team",
        },
    });
    const info = await transporter.sendMail({
        from: "pixelteam@smtech24.com",
        to: email,
        subject: subject,
        html,
    });
};
exports.default = emailSender;
