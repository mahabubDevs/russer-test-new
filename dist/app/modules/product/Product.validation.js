"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidation = void 0;
const zod_1 = require("zod");
const priceValidationSchema = zod_1.z.object({
    serviceType: zod_1.z.enum(["snow", "lawn"], {
        required_error: "Service type is required",
    }),
    area: zod_1.z.number({
        required_error: "Area is required",
        invalid_type_error: "Area must be a number",
    }),
    driveways: zod_1.z.array(zod_1.z.enum(["1-car", "2-car", "3-car"])).optional(),
    isCornerLot: zod_1.z.boolean().optional(),
    extraFeet: zod_1.z.number().optional(),
    isSteep: zod_1.z.boolean().optional(),
    isPriority: zod_1.z.boolean().optional(),
});
exports.ProductValidation = {
    priceValidationSchema,
};
