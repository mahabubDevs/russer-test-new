import { UserRole } from "@prisma/client";
import prisma from "../../shared/prisma";
import * as bcrypt from "bcrypt";
import config from "../../config";
export const initiateSuperAdmin = async () => {
  const hashedPassword=await bcrypt.hash('123456789',Number(config.bcrypt_salt_rounds))
  const payload: any = {
    fullName : "Super",
    // username: "Admin",
    email: "belalhossain22000@gmail.com",
    // phoneNumber: "1234567890",
    password: hashedPassword,
    role: UserRole.Customer,
    lat: 23.8103,
    lng: 90.4125,
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      // username: payload.username,
      email: payload.email,
     

    },
  });

  if (isExistUser) return;

  await prisma.user.create({
    data: payload,
  });
};
