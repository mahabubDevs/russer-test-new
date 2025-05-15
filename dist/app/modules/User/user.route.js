"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const fileUploader_1 = require("../../../helpars/fileUploader");
const router = express_1.default.Router();
router.post("/register", fileUploader_1.fileUploader.uploadMultipleImage, // Multer middleware for handling multiple files
user_controller_1.userController.createUser);
router.put("/update-profile/:id", (0, auth_1.default)(), user_controller_1.userController.updateProfile);
router.put("/update-profileImage/:id", (0, auth_1.default)(), fileUploader_1.fileUploader.uploadSingle, user_controller_1.userController.updateProfileImage);
router.put("/update-document/:id", (0, auth_1.default)(client_1.UserRole.Provider), fileUploader_1.fileUploader.uploadMultipleImage, user_controller_1.userController.updateUserDocument);
router.get("/profile/:id", (0, auth_1.default)(), user_controller_1.userController.getUserProfile);
router.delete('/profile/:id', (0, auth_1.default)(client_1.UserRole.Provider), user_controller_1.userController.deleteUserDocumentImage);
exports.userRoutes = router;
