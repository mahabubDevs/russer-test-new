import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();




router.post(
  "/register",
  fileUploader.uploadMultipleImage, // Multer middleware for handling multiple files
  userController.createUser
);
router.post("/verify-email", userController.verifyEmail);
router.put("/update-profile/:id",auth(), userController.updateProfile);
router.put("/update-profileImage/:id", auth(), fileUploader.uploadSingle, userController.updateProfileImage);
router.put("/update-document/:id", auth(UserRole.Provider), fileUploader.uploadMultipleImage, userController.updateUserDocument);

router.get("/profile/:id", auth(), userController.getUserProfile);

router.delete('/profile/:id', auth(UserRole.Provider), userController.deleteUserDocumentImage);


export const userRoutes = router;
