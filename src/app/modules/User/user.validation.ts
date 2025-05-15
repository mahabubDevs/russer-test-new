import { z } from "zod";
import { Role } from "../../db/db.interface";
import { UserRole } from "@prisma/client";

const CreateUserValidationSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"), // Ensure email is provided and is valid

  name: z.string().optional(),
  //  phoneNumber : z
  // .string()
  // .trim()
  // .regex(
  //   /^\+?[1-9]\d{1,14}$/,
  //   "Phone number must be a valid international format (E.164)"
  // )
  // .optional(),
  phoneNumber: z.string().optional().default(""),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
});

export { CreateUserValidationSchema };
const UserLoginValidationSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
    role:z.nativeEnum(UserRole)
});

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  promoCode: z.string().optional(),
  profession: z.string().optional(),
});

export const UserValidation = {
  CreateUserValidationSchema,
  UserLoginValidationSchema,
  userUpdateSchema,
};
