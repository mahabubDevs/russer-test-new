  import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.services";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.costant";
import { fileUploader } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../shared/emailSender";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { IUser } from "./user.interface";

// const createUser = catchAsync(async (req: Request, res: Response) => {
//   const result = await userService.createUserIntoDb(req.body,req);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User Registered successfully!",
//     data: result,
//   });
// });








const createUser = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const body = JSON.parse(req.body.data); // Parse the JSON string from "data"

  let imageUrls: string[] = [];

  if (files?.images && files.images.length > 0) {
    const uploads = await Promise.all(
      files.images.map(async (file) => {
        // Upload to Cloudinary (or switch to uploadToDigitalOcean if needed)
        const uploaded = await fileUploader.uploadToCloudinary(file);
        return uploaded.Location;
      })
    );
    imageUrls = uploads;
  }

  // Combine user data with image URLs
  const userPayload = {
    ...body,
    images: imageUrls,
  };
  
  const user = await userService.createUserIntoDb(userPayload);

  console.log("user", user);
  
   res.status(200).json({
    success: true,
    message: "Otp send successfully!",
  
  });

  // res.status(201).json({
  //   success: true,
  //   message: "User registered successfully!",
  //   data: user,
  // });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await userService.verifyEmail(email, otp);
  if (!user) {
    throw new ApiError(400, "Invalid OTP");
  }
  res.status(200).json({
    success: true,
    message: "Email verified successfully!",
    data: user,
  });
});






// const createUser = catchAsync(async (req: Request, res: Response) => {
//   const stringData = req.body.data;
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//   if (!stringData) throw new ApiError(400, "Missing user data in 'data' field");

//   const body = JSON.parse(stringData); // Parse the JSON string from "data"
//   let imageUrls: string[] = [];

//   if (files?.images && files.images.length > 0) {
//     const uploads = await Promise.all(
//       files.images.map(async (file) => {
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return uploaded.Location;
//       })
//     );
//     imageUrls = uploads;
//   }

//   const userPayload = {
//     ...body,
//     images: imageUrls, // Attach uploaded image URLs
//   };

//   const user = await userService.createUserIntoDb(userPayload);

//   res.status(201).json({
//     success: true,
//     message: "User registered successfully!",
//     data: user,
//   });
// });





// const updateProfile = catchAsync(async (req: Request, res: Response) => {
//   console.log("updateProfile", req.body);
//   const userId = req.params.id;
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   const body = req.body;
//   console.log("updateProfile body", body);
//   let imageUrls: string[] = [];
//   if (files?.images && files.images.length > 0) {
//     const uploads = await Promise.all(
//       files.images.map(async (file) => {
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return uploaded.Location;
//       })
//     );
//     imageUrls = uploads;
//   }
//   const userPayload = {
//     ...body,
//     images: imageUrls, // Attach uploaded image URLs
//   };
//   const user = await userService.updateUserProfile(userId, userPayload,req);
//   res.status(200).json({
//     success: true,
//     message: "User profile updated successfully!",
//     data: user,
//   });
// });



 const updateProfile = catchAsync(async (req: Request, res: Response) => {
  console.log("updateProfile", req.body);  // For debugging incoming request data

  // Get the userId from the request parameters (from the URL)
  const userId = req.params.id;
  
  // Get the updated user data from the request body
  const body = req.body;

  // Construct the user payload (without images) for the update
  const userPayload = {
    ...body,  // Use all the fields from the body data (firstName, lastName, etc.)
  };

  // Call the service to update the user profile in the database
  const user = await userService.updateUserProfile(userId, userPayload);

  // Send the response to indicate that the profile has been updated
  res.status(200).json({
    success: true,
    message: "User profile updated successfully!",
    data: user,
  });
});



// const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.params.id;
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   const body = req.body;
//   let imageUrls: string[] = [];
//   if (files?.images && files.images.length > 0) {
//     const uploads = await Promise.all(
//       files.images.map(async (file) => {
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return uploaded.Location;
//       })
//     );
//     imageUrls = uploads;
//   }
//   const userPayload = {
//     ...body,
//     images: imageUrls, // Attach uploaded image URLs
//   };
//   const user = await userService.updateProfileImage(userId, userPayload,req);
//   res.status(200).json({
//     success: true,
//     message: "User profile updated successfully!",
//     data: user,
//   });
// });













// get all user form db
// const getUsers = catchAsync(async (req: Request, res: Response) => {

//   const filters = pick(req.query, userFilterableFields);
//   const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

//   const result = await userService.getUsersFromDb(filters, options);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Users retrieve successfully!",
//     data: result,
//   });
// });


const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const file = req.file; //



  if (!file) {
    throw new ApiError(400, "No image found"); 
  }

  // Cloudinary image upload
  const uploaded = await fileUploader.uploadToCloudinary(file);
  const imageUrl = uploaded.Location;

  // service call to update user profile image
  const user = await userService.updateUserProfileImage(userId, imageUrl);

  // service call to update user profile image
  res.status(200).json({
    success: true,
    message: "User profile image updated successfully!",
    data: user,
  });
});


const updateUserDocument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // if not found any image
  if (!files?.images || files.images.length === 0) {
    throw new ApiError(400, "No images found"); 
  }

  // Every image upload to cloudinary
  const imageUrls = await Promise.all(
    files.images.map(async (file) => {
      const uploaded = await fileUploader.uploadToCloudinary(file);
      return uploaded.Location;
    })
  );

  // service call to update user document
  const user = await userService.updateUserDocument(userId, imageUrls);

  res.status(200).json({
    success: true,
    message: "successfully updated user document!",
    data: user,
  });
});


const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = await userService.getUserProfile(userId);
  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully!",
    data: user,
  });
});




const deleteUserDocumentImage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw new ApiError(400, "Image URL is required");
  }

  const user = await userService.deleteUserDocumentImage(userId, imageUrl);

  res.status(200).json({
    success: true,
    message: "Image deleted successfully!",
    data: user,
  });
});





export const userController = {
  createUser,
  updateProfile,
  updateProfileImage,
  updateUserDocument,
  getUserProfile,
  deleteUserDocumentImage,
  verifyEmail,
 
};
