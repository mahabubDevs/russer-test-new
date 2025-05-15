"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const app_1 = __importDefault(require("./app"));
let server;
async function startServer() {
    server = app_1.default.listen(config_1.default.port, () => {
        console.log("Server is listiening on port ", config_1.default.port);
    });
}
async function main() {
    await startServer();
    const exitHandler = () => {
        if (server) {
            server.close(() => {
                console.info("Server closed!");
                restartServer();
            });
        }
        else {
            process.exit(1);
        }
    };
    const restartServer = () => {
        console.info("Restarting server...");
        main();
    };
    process.on("uncaughtException", (error) => {
        console.log("Uncaught Exception: ", error);
        exitHandler();
    });
    process.on("unhandledRejection", (error) => {
        console.log("Unhandled Rejection: ", error);
        exitHandler();
    });
    // Handling the server shutdown with SIGTERM and SIGINT
    process.on("SIGTERM", () => {
        console.log("SIGTERM signal received. Shutting down gracefully...");
        exitHandler();
    });
    process.on("SIGINT", () => {
        console.log("SIGINT signal received. Shutting down gracefully...");
        exitHandler();
    });
}
main();
