"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Product_controller_1 = require("./Product.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const Product_validation_1 = require("./Product.validation");
const productValidation_1 = __importDefault(require("../../middlewares/productValidation"));
const router = express_1.default.Router();
// Price Calculation Route
router.post("/calculate", (0, auth_1.default)(client_1.UserRole.Customer), (0, productValidation_1.default)(Product_validation_1.ProductValidation.priceValidationSchema), Product_controller_1.ProductController.calculatePrice);
router.get("/get-product/:id", (0, auth_1.default)(client_1.UserRole.Customer), Product_controller_1.ProductController.getAllPrices);
exports.ProductRoutes = router;
