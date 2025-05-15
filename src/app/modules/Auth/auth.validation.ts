import { z } from "zod";

const changePasswordValidationSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

 const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const authValidation={
    changePasswordValidationSchema,
    resetPasswordSchema
}