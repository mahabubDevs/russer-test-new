"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = exports.CreateUserValidationSchema = void 0;
const zod_1 = require("zod");
const CreateUserValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").min(1, "Email is required"), // Ensure email is provided and is valid
    name: zod_1.z.string().optional(),
    //  phoneNumber : z
    // .string()
    // .trim()
    // .regex(
    //   /^\+?[1-9]\d{1,14}$/,
    //   "Phone number must be a valid international format (E.164)"
    // )
    // .optional(),
    phoneNumber: zod_1.z.string().optional().default(""),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .nonempty("Password is required"),
});
exports.CreateUserValidationSchema = CreateUserValidationSchema;
const UserLoginValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email().nonempty("Email is required"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .nonempty("Password is required"),
});
const userUpdateSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    promoCode: zod_1.z.string().optional(),
    profession: zod_1.z.string().optional(),
});
exports.UserValidation = {
    CreateUserValidationSchema,
    UserLoginValidationSchema,
    userUpdateSchema,
};
