"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const user_services_1 = require("./user.services");
const fileUploader_1 = require("../../../helpars/fileUploader");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
// const createUser = catchAsync(async (req: Request, res: Response) => {
//   const result = await userService.createUserIntoDb(req.body,req);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User Registered successfully!",
//     data: result,
//   });
// });
// const createUser = catchAsync(async (req: Request, res: Response) => {
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   const body = req.body;
//   let imageUrls: string[] = [];
//   if (files?.images && files.images.length > 0) {
//     const uploads = await Promise.all(
//       files.images.map(async (file) => {
//         // Upload to Cloudinary (or switch to uploadToDigitalOcean if needed)
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return uploaded.Location;
//       })
//     );
//     imageUrls = uploads;
//   }
//   // Combine user data with image URLs
//   const userPayload = {
//     ...body,
//     images: imageUrls,
//   };
//   const user = await userService.createUserIntoDb(userPayload);
//   res.status(201).json({
//     success: true,
//     message: "User registered successfully!",
//     data: user,
//   });
// });
const createUser = (0, catchAsync_1.default)(async (req, res) => {
    const stringData = req.body.data;
    const files = req.files;
    if (!stringData)
        throw new ApiErrors_1.default(400, "Missing user data in 'data' field");
    const body = JSON.parse(stringData); // Parse the JSON string from "data"
    let imageUrls = [];
    if (files?.images && files.images.length > 0) {
        const uploads = await Promise.all(files.images.map(async (file) => {
            const uploaded = await fileUploader_1.fileUploader.uploadToCloudinary(file);
            return uploaded.Location;
        }));
        imageUrls = uploads;
    }
    const userPayload = {
        ...body,
        images: imageUrls, // Attach uploaded image URLs
    };
    const user = await user_services_1.userService.createUserIntoDb(userPayload);
    res.status(201).json({
        success: true,
        message: "User registered successfully!",
        data: user,
    });
});
const updateProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.id;
    const files = req.files;
    const body = req.body;
    let imageUrls = [];
    if (files?.images && files.images.length > 0) {
        const uploads = await Promise.all(files.images.map(async (file) => {
            const uploaded = await fileUploader_1.fileUploader.uploadToCloudinary(file);
            return uploaded.Location;
        }));
        imageUrls = uploads;
    }
    const userPayload = {
        ...body,
        images: imageUrls, // Attach uploaded image URLs
    };
    const user = await user_services_1.userService.updateUserProfile(userId, userPayload, req);
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
const updateProfileImage = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.id;
    const file = req.file; //
    if (!file) {
        throw new ApiErrors_1.default(400, "No image found");
    }
    // Cloudinary image upload
    const uploaded = await fileUploader_1.fileUploader.uploadToCloudinary(file);
    const imageUrl = uploaded.Location;
    // service call to update user profile image
    const user = await user_services_1.userService.updateUserProfileImage(userId, imageUrl);
    // service call to update user profile image
    res.status(200).json({
        success: true,
        message: "User profile image updated successfully!",
        data: user,
    });
});
const updateUserDocument = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.id;
    const files = req.files;
    // if not found any image
    if (!files?.images || files.images.length === 0) {
        throw new ApiErrors_1.default(400, "No images found");
    }
    // Every image upload to cloudinary
    const imageUrls = await Promise.all(files.images.map(async (file) => {
        const uploaded = await fileUploader_1.fileUploader.uploadToCloudinary(file);
        return uploaded.Location;
    }));
    // service call to update user document
    const user = await user_services_1.userService.updateUserDocument(userId, imageUrls);
    res.status(200).json({
        success: true,
        message: "successfully updated user document!",
        data: user,
    });
});
const getUserProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.id;
    const user = await user_services_1.userService.getUserProfile(userId);
    res.status(200).json({
        success: true,
        message: "User profile retrieved successfully!",
        data: user,
    });
});
const deleteUserDocumentImage = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.id;
    const { imageUrl } = req.body;
    if (!imageUrl) {
        throw new ApiErrors_1.default(400, "Image URL is required");
    }
    const user = await user_services_1.userService.deleteUserDocumentImage(userId, imageUrl);
    res.status(200).json({
        success: true,
        message: "Image deleted successfully!",
        data: user,
    });
});
exports.userController = {
    createUser,
    updateProfile,
    updateProfileImage,
    updateUserDocument,
    getUserProfile,
    deleteUserDocumentImage
};
