import { z } from "zod";

const productValidationSchema = z.object({
  serviceType: z.enum(["snow", "lawn"], {
    required_error: "Service type is required",
  }),
  area: z.number({
    required_error: "Area is required",
    invalid_type_error: "Area must be a number",
  }),
  driveways: z.array(z.enum(["1-car", "2-car", "3-car"])).optional(),
  isCornerLot: z.boolean().optional(),
  extraFeet: z.number().optional(),
  isSteep: z.boolean().optional(),
  isPriority: z.boolean().optional(),
});

export const ProductValidation = {
  productValidationSchema
};
















