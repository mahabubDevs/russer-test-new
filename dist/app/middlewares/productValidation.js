"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// validateRequest middleware function
const ProductvalidateRequest = (schema) => async (req, res, next) => {
    try {
        // validate req.body against the schema
        await schema.parseAsync(req.body);
        return next(); // Proceed to the next middleware/controller
    }
    catch (err) {
        // If validation fails, pass the error to the next middleware
        next(err);
    }
};
exports.default = ProductvalidateRequest;
