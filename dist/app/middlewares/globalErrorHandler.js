"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../../errors/handleZodError"));
const parsePrismaValidationError_1 = __importDefault(require("../../errors/parsePrismaValidationError"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
// TODO Replace `config.NODE_ENV` with your actual environment configuration
// TODO
const config = {
    NODE_ENV: process.env.NODE_ENV || "development",
};
const GlobalErrorHandler = (err, req, res, next) => {
    let statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!";
    let errorSources = [];
    let errorDetails = err || null;
    // Handle Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    // Handle Custom ApiError
    else if (err instanceof ApiErrors_1.default) {
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [{ type: "ApiError", details: err.message }];
    }
    // handle prisma client validation errors
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = (0, parsePrismaValidationError_1.default)(err.message);
        errorSources.push("Prisma Client Validation Error");
    }
    // Prisma Client Initialization Error
    else if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message =
            "Failed to initialize Prisma Client. Check your database connection or Prisma configuration.";
        errorSources.push("Prisma Client Initialization Error");
    }
    // Prisma Client Rust Panic Error
    else if (err instanceof client_1.Prisma.PrismaClientRustPanicError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message =
            "A critical error occurred in the Prisma engine. Please try again later.";
        errorSources.push("Prisma Client Rust Panic Error");
    }
    // Prisma Client Unknown Request Error
    else if (err instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message = "An unknown error occurred while processing the request.";
        errorSources.push("Prisma Client Unknown Request Error");
    }
    // Generic Error Handling (e.g., JavaScript Errors)
    else if (err instanceof SyntaxError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Syntax error in the request. Please verify your input.";
        errorSources.push("Syntax Error");
    }
    else if (err instanceof TypeError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Type error in the application. Please verify your input.";
        errorSources.push("Type Error");
    }
    else if (err instanceof ReferenceError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Reference error in the application. Please verify your input.";
        errorSources.push("Reference Error");
    }
    // Catch any other error type
    else {
        message = "An unexpected error occurred!";
        errorSources.push("Unknown Error");
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err,
        stack: config.NODE_ENV === "development" ? err?.stack : null,
    });
};
exports.default = GlobalErrorHandler;
