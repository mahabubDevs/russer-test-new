// import { NextFunction, Request, Response } from "express";
// import { AnyZodObject } from "zod";

// // validateRequest middleware function
// const ProductvalidateRequest =
//   (schema: AnyZodObject) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // validate req.body against the schema
//       await schema.parseAsync(req.body);
//       return next(); // Proceed to the next middleware/controller
//     } catch (err) {
//       // If validation fails, pass the error to the next middleware
//       next(err);
//     }
//   };

// export default ProductvalidateRequest;

import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

const ProductvalidateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stringData = req.body.data;

      if (!stringData) {
        return res.status(400).json({
          success: false,
          message: "Missing required 'data' field in form-data",
        });
      }

      // Parse JSON string into object
      const parsedData = JSON.parse(stringData);

      // Validate against Zod schema
      await schema.parseAsync(parsedData);

      // Replace req.body with parsed data so controllers get clean input
      req.body = parsedData;

      // Attach files if needed
      if (req.files) {
        req.body.files = req.files;
      }

      return next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: err,
      });
    }
  };

export default ProductvalidateRequest;

