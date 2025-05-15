"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/User/user.route");
const auth_routes_1 = require("../modules/Auth/auth.routes");
const StripePayment_routes_1 = require("../modules/Payment/StripePayment.routes");
const Product_routes_1 = require("../modules/product/Product.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/users",
        route: user_route_1.userRoutes,
    },
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/payments",
        route: StripePayment_routes_1.StripeRoutes,
    },
    {
        path: "/products",
        route: Product_routes_1.ProductRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
