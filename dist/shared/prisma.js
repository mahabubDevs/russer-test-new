"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const db_1 = require("../app/db/db");
const prisma = new client_1.PrismaClient();
async function connectPrisma() {
    try {
        await prisma.$connect();
        console.log("Prisma connected to the database successfully!");
        // initiate super admin
        (0, db_1.initiateSuperAdmin)();
    }
    catch (error) {
        console.error("Prisma connection failed:", error);
        process.exit(1); // Exit process with failure
    }
    // Graceful shutdown
    process.on("SIGINT", async () => {
        await prisma.$disconnect();
        console.log("Prisma disconnected due to application termination.");
        process.exit(0);
    });
}
connectPrisma();
exports.default = prisma;
