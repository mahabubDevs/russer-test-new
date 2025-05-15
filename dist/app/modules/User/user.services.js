"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const bcrypt = __importStar(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const fileUploader_1 = require("../../../helpars/fileUploader");
// Create a new user in the database.
// const createUserIntoDb = async (payload: User ,req:Request) => {
//   console.log("Payload:", payload);
//   console.log("files", req.files);
//   console.log("BODY:", req.body);
//   const existingUser = await prisma.user.findFirst({
//     where: {
//       OR: [{ email: payload.email }],
//     },
//   });
//   if (existingUser) {
//     if (existingUser.email === payload.email) {
//       throw new ApiError(
//         400,
//         `User with this email ${payload.email} already exists`
//       );
//     }
//     // if (existingUser.username === payload.username) {
//     //   throw new ApiError(
//     //     400,
//     //     `User with this username ${payload.username} already exists`
//     //   );
//     // }
//   }
//   const hashedPassword: string = await bcrypt.hash(
//     payload.password,
//     Number(config.bcrypt_salt_rounds)
//   );
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   console.log("Files:", files);
//   let imageUrls: string[] = [];
//   if (files?.images && files.images.length > 0) {
//     const uploads = await Promise.all(
//       files.images.map(async (file) => {
//         const uploadResult = await fileUploader.uploadToCloudinary(file);
//         return uploadResult.Location;
//       })
//     );
//     imageUrls = uploads;
//   }
//   console.log("Image URLs:", imageUrls);
//   const result = await prisma.user.create({
//     data: { ...payload, password: hashedPassword ,images: imageUrls,},
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       phoneNumber: true,
//       images: true,
//       email: true,
//       role: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//   return result;
// };
const createUserIntoDb = async (payload) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const result = await prisma_1.default.user.create({
        data: {
            ...payload,
            password: hashedPassword,
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
    return result;
};
const updateUserProfile = async (userId, payload, req) => {
    const userInfo = await prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    });
    if (!userInfo)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found with id: " + userId);
    const files = req.files;
    let imageUrls = [];
    if (files?.images && files.images.length > 0) {
        const uploads = await Promise.all(files.images.map(async (file) => {
            const uploaded = await fileUploader_1.fileUploader.uploadToCloudinary(file);
            return uploaded.Location;
        }));
        imageUrls = uploads;
    }
    const result = await prisma_1.default.user.update({
        where: {
            id: userInfo.id,
        },
        data: {
            ...payload,
            images: imageUrls,
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
    if (!result)
        throw new ApiErrors_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update user profile");
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
const updateUserProfileImage = async (userId, imageUrl) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiErrors_1.default(404, "User not found");
    }
    const updatedUser = await prisma_1.default.user.update({
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
const updateUserDocument = async (userId, imageUrls) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiErrors_1.default(404, "ইউজার খুঁজে পাওয়া যায়নি");
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            images: { push: imageUrls }, // নতুন ছবি আগের ছবির সাথে যুক্ত করা
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
const getUserProfile = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
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
        throw new ApiErrors_1.default(404, "User not found");
    }
    return user;
};
const deleteFirstMatchFromArray = (arr, valueToRemove) => {
    const index = arr.indexOf(valueToRemove);
    if (index === -1)
        return arr;
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
};
const deleteUserDocumentImage = async (userId, imageUrl) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiErrors_1.default(404, "ইউজার খুঁজে পাওয়া যায়নি");
    }
    // কেবলমাত্র প্রথম মিলে যাওয়া ছবি মুছে ফেলা
    const updatedImages = deleteFirstMatchFromArray(user.images, imageUrl);
    const updatedUser = await prisma_1.default.user.update({
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
exports.userService = {
    createUserIntoDb,
    updateUserProfile,
    updateUserProfileImage,
    updateUserDocument,
    getUserProfile,
    deleteUserDocumentImage
    // getUsersFromDb,
    // updateProfile,
    // updateUserIntoDb,
};
