import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { IUser, IUserFilterRequest } from "./user.interface";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma, User } from "@prisma/client";
import { userSearchAbleFields } from "./user.costant";
import config from "../../../config";
import httpStatus from "http-status";
import { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { string } from "zod";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import emailSender from "../../../shared/emailSender";
import { json } from "stream/consumers";
// Create a new user in the database.







const createUserIntoDb = async (payload: IUser) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);


  

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      email: payload.email,
     
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });

console.log("result", result);

  // Generate a new OTP
  const otp = Number(crypto.randomInt(1000, 9999));

  // Set OTP expiration time to 10 minutes from now
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Create the email content
  const html = `
<div style="font-family: Arial, sans-serif; color: #333; padding: 30px; background: linear-gradient(135deg, #6c63ff, #3f51b5); border-radius: 8px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
        <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin-bottom: 20px;">
            <span style="color: #ffeb3b;">Verify Account OTP</span>
        </h2>
        <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
            Your Register Verification OTP code is below.
        </p>
        <p style="font-size: 32px; font-weight: bold; color: #ff4081; text-align: center; margin: 20px 0;">
            ${otp}
        </p>
        <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
            </p>
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                If you need assistance, feel free to contact us.
            </p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                Best Regards,<br/>
                <span style="font-weight: bold; color: #3f51b5;">Nmbull Team</span><br/>
                <a href="mailto:support@nmbull.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">Contact Support</a>
            </p>
        </div>
    </div>
</div> `;

  // Send the OTP email to the user
  await emailSender( result.email, html,'Email verification request',);

  // Update the user's OTP and expiration in the database
  await prisma.user.update({
    where: { id: result.id },
    data: {
      otp: otp,
      expirationOtp: otpExpires,
    },
  });

  return { message: ' OTP sent to your email successfully' };
 

};


const verifyEmail = async (email: string, otp: number) => {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Check if the OTP matches and is not expired
  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }
  const currentTime = new Date();

  if (!user.expirationOtp && user.expirationOtp! < currentTime) {
    throw new ApiError(400, "OTP has expired");
  }
  // Update the user's email verification status
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      otp: null, // Clear the OTP after verification
      expirationOtp: null, // Clear the expiration time
    },
    select: {
      id: true,
      firstName: true,      
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updatedUser;

  // Generate a JWT token
}


const updateUserProfile = async (
  userId: string,
  payload: IUser
) => {
  // Fetch the existing user info from the database using the userId
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  // If the user doesn't exist, throw an error
  if (!userInfo)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + userId);

  // Update the user profile with the new data (excluding images)
  const result = await prisma.user.update({
    where: {
      id: userInfo.id,  // Identifying the user by ID to update
    },
    data: {
      ...payload,  // Apply all the fields from the payload (firstName, lastName, etc.)
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // If the update failed, throw an error
  if (!result)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update user profile");

  return result;
};



// const updateProfileImage = async (
//   userId: string,
//   payload: IUser,
//   req: Request
// ) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       id: userId,
//     },
//   });
//   if (!userInfo)
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + userId);
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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
//   const result = await prisma.user.update({
//     where: {
//       id: userInfo.id,
//     },
//     data: {
//       ...payload,
//       profileImage: imageUrls[0] || null,
//     },
//     select: {
//       id: true,
//       profileImage: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//   if (!result)
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       "Failed to update user profile"
//     );
//   return result;
// };




// reterive all users from the database also searcing anf filetering
// const getUsersFromDb = async (
//   params: IUserFilterRequest,
//   options: IPaginationOptions
// ) => {
//   const { page, limit, skip } = paginationHelper.calculatePagination(options);
//   const { searchTerm, ...filterData } = params;

//   const andCondions: Prisma.UserWhereInput[] = [];

//   if (params.searchTerm) {
//     andCondions.push({
//       OR: userSearchAbleFields.map((field) => ({
//         [field]: {
//           contains: params.searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length > 0) {
//     andCondions.push({
//       AND: Object.keys(filterData).map((key) => ({
//         [key]: {
//           equals: (filterData as any)[key],
//         },
//       })),
//     });
//   }
//   const whereConditons: Prisma.UserWhereInput = { AND: andCondions };

//   const result = await prisma.user.findMany({
//     where: whereConditons,
//     skip,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? {
//             [options.sortBy]: options.sortOrder,
//           }
//         : {
//             createdAt: "desc",
//           },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       // username: true,
//       email: true,
//       profileImage: true,
//       role: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//   const total = await prisma.user.count({
//     where: whereConditons,
//   });

//   if (!result || result.length === 0) {
//     throw new ApiError(404, "No active users found");
//   }
//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

// update profile by user won profile uisng token or email and id


// update user data into database by id fir admin
// const updateUserIntoDb = async (payload: IUser, id: string) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       id: id,
//     },
//   });
//   if (!userInfo)
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);

//   const result = await prisma.user.update({
//     where: {
//       id: userInfo.id,
//     },
//     data: payload,
//     select: {
//       id: true,
//       // fullName: true,
//       firstName: true,
//       lastName: true,

//       email: true,
//       profileImage: true,
//       role: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

//   if (!result)
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       "Failed to update user profile"
//     );

//   return result;
// };


const updateUserProfileImage = async (userId: string, imageUrl: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImage: imageUrl, // প্রোফাইল ছবির URL আপডেট করা
    },
    select: {
      id: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const updateUserDocument = async (userId: string, imageUrls: string[]) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      images: { push: imageUrls }, // Push new images to the existing array
    },
    select: {
      id: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};



const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      role: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};




const deleteFirstMatchFromArray = (arr: string[], valueToRemove: string): string[] => {
  const index = arr.indexOf(valueToRemove);
  if (index === -1) return arr;
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

const deleteUserDocumentImage = async (userId: string, imageUrl: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "ইউজার খুঁজে পাওয়া যায়নি");
  }

  // কেবলমাত্র প্রথম মিলে যাওয়া ছবি মুছে ফেলা
  const updatedImages = deleteFirstMatchFromArray(user.images, imageUrl);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      images: updatedImages,
    },
    select: {
      id: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};



export const userService = {
  createUserIntoDb,
  updateUserProfile,
  updateUserProfileImage,
  updateUserDocument,
  getUserProfile,
  deleteUserDocumentImage,
  verifyEmail
  // getUsersFromDb,
  // updateProfile,
  // updateUserIntoDb,
};
