"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const jwtHelpers_1 = require("../../helpars/jwtHelpers");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.jwt_secret);
            const { id, role, iat } = verifiedUser;
            const user = await prisma_1.default.user.findUnique({
                where: {
                    id: id,
                },
            });
            if (!user) {
                throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found!");
            }
            if (user.status === "BLOCKED") {
                throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Your account is blocked!");
            }
            req.user = verifiedUser;
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.default = auth;
