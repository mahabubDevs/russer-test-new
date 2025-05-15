"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const zod_1 = require("zod");
const changePasswordValidationSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(8),
    newPassword: zod_1.z.string().min(8),
});
exports.authValidation = {
    changePasswordValidationSchema
};
