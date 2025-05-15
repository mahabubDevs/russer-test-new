"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateSuperAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const bcrypt = __importStar(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const initiateSuperAdmin = async () => {
    const hashedPassword = await bcrypt.hash('123456789', Number(config_1.default.bcrypt_salt_rounds));
    const payload = {
        fullName: "Super",
        // username: "Admin",
        email: "belalhossain22000@gmail.com",
        // phoneNumber: "1234567890",
        password: hashedPassword,
        role: client_1.UserRole.Customer,
    };
    const isExistUser = await prisma_1.default.user.findUnique({
        where: {
            // username: payload.username,
            email: payload.email,
        },
    });
    if (isExistUser)
        return;
    await prisma_1.default.user.create({
        data: payload,
    });
};
exports.initiateSuperAdmin = initiateSuperAdmin;
