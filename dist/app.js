"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const express_1 = __importDefault(require("express"));
const http_status_1 = __importDefault(require("http-status"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const app = (0, express_1.default)();
exports.corsOptions = {
    origin: ["http://localhost:3001", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
// Middleware setup
app.use((0, cors_1.default)(exports.corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
// Route handler for root endpoint
app.get("/", (req, res) => {
    res.send({
        success: true,
        statusCode: http_status_1.default.OK,
        message: "The server is running!",
    });
});
// Router setup
app.use("/api/v1", routes_1.default);
// Error handling middleware
app.use(globalErrorHandler_1.default);
// Not found handler
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});
exports.default = app;
