"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
// Utility function: calculate base price
const getBasePrice = (area) => {
    if (area <= 3000)
        return 45 + 45 * 0.10; // $45 + 10%
    if (area <= 5000)
        return 65 + 65 * 0.10; // $65 + 10%
    if (area <= 8000)
        return 85 + 85 * 0.10; // $85 + 10%
    if (area <= 12000)
        return 100 + 100 * 0.10; // $100 + 10%
    // If area is larger, calculate per square foot
    const base = area * 0.01; // Assume $0.01 per sq ft
    return base + base * 0.10; // + 10% extra
};
// Utility function: calculate additional snow service charges
const calculateAdditionsPrice = (data) => {
    let additions = 0;
    // Driveways
    if (data.driveways && data.driveways.length > 0) {
        data.driveways.forEach((type) => {
            if (type === "1-car")
                additions += 45;
            if (type === "2-car")
                additions += 65;
            if (type === "3-car")
                additions += 85;
        });
    }
    // Corner Lot
    if (data.isCornerLot)
        additions += 15;
    // Extra Feet
    if (data.extraFeet && data.extraFeet > 0) {
        additions += Math.ceil(data.extraFeet / 20) * 10;
    }
    // Steep Driveway
    if (data.isSteep)
        additions += 15;
    // Priority
    if (data.isPriority)
        additions += 20;
    return additions;
};
// Main: Calculate total price
const calculatePrice = async (data) => {
    console.log("Calculating price for data:", data);
    // Ensure we have userId for tracking purposes
    if (!data.userId) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "User ID is required.");
    }
    const basePrice = getBasePrice(data.area);
    if (basePrice === 0) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Custom quote area. Please contact support.");
    }
    let additionsPrice = 0;
    if (data.serviceType === "snow") {
        additionsPrice = calculateAdditionsPrice(data);
    }
    const totalPrice = basePrice + additionsPrice;
    // Save to database and associate with the user
    await prisma_1.default.priceCalculation.create({
        data: {
            serviceType: data.serviceType || "snow",
            address: data.address || "Unknown Address",
            location: data.location || "Unknown",
            perimeter: data.perimeter || 0,
            area: data.area,
            lat: isNaN(Number(data.lat)) ? 0 : Number(data.lat),
            lng: isNaN(Number(data.lng)) ? 0 : Number(data.lng),
            driveways: data.driveways || [],
            isCornerLot: data.isCornerLot || false,
            extraFeet: data.extraFeet || 0,
            isSteep: data.isSteep || false,
            isPriority: data.isPriority || false,
            basePrice,
            additionsPrice,
            totalPrice,
            userId: data.userId,
        },
    });
    return {
        address: data.address,
        location: data.location,
        basePrice,
        additionsPrice,
        totalPrice,
    };
};
const getAll = async (userId) => {
    const prices = await prisma_1.default.priceCalculation.findMany({
        where: { userId },
    });
    return prices.map((price) => ({
        id: price.id,
        address: price.address,
        location: price.location,
        serviceType: price.serviceType,
        perimeter: price.perimeter,
        area: price.area,
        driveways: price.driveways,
        isCornerLot: price.isCornerLot,
        extraFeet: price.extraFeet,
        isSteep: price.isSteep,
        isPriority: price.isPriority,
        basePrice: price.basePrice,
        additionsPrice: price.additionsPrice,
        totalPrice: price.totalPrice,
    }));
};
const getPriceById = async (id) => {
    const price = await prisma_1.default.priceCalculation.findUnique({
        where: { id },
    });
    if (!price) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Price calculation not found.");
    }
    return price;
};
exports.PriceService = {
    calculatePrice,
    getPriceById,
    getAll
};
