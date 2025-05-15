"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const Product_service_1 = require("./Product.service");
// PriceCalculation করতে গেলে UserId সহ ডেটা নিতে হবে
const calculatePrice = async (req, res) => {
    console.log("calculatePrice", req.body);
    try {
        // এখানে আমরা req.body তে userId পাঠানোর কথা বলছি
        // আগে থেকেই userId req.body তে পাস করা হলে, তা priceCalculation এ সঠিকভাবে অন্তর্ভুক্ত হবে
        console.log("calculatePrice try", req.body);
        // PriceCalculation করার সময় req.body তে userId থাকতে হবে
        const result = await Product_service_1.PriceService.calculatePrice(req.body);
        console.log("calculatePrice result", result);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
};
const getAllPrices = async (req, res) => {
    try {
        const result = await Product_service_1.PriceService.getAll(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
};
exports.ProductController = {
    calculatePrice,
    getAllPrices,
};
