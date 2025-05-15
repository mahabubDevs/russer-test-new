
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

import { CreateProductRequest,ProductResponse } from "./Product.interface";
import { ProductStatus } from "@prisma/client";


const getBasePrice = (area: number): number => {
  if (area <= 3000) return 45 + 45 * 0.10;       // $45 + 10%
  if (area <= 5000) return 65 + 65 * 0.10;       // $65 + 10%
  if (area <= 8000) return 85 + 85 * 0.10;       // $85 + 10%
  if (area <= 12000) return 100 + 100 * 0.10;    // $100 + 10%

  // If area is larger, calculate per square foot
  const base = area * 0.01;                      // Assume $0.01 per sq ft
  return base + base * 0.10;                     // + 10% extra
};

const calculateAdditionsPrice = (data: any): number => {
  let additions = 0;

  // Driveways
  if (data.driveways && data.driveways.length > 0) {
    data.driveways.forEach((type:any) => {
      if (type === "1-car") additions += 45;
      if (type === "2-car") additions += 65;
      if (type === "3-car") additions += 85;
    });
  }


  if (data.isCornerLot) additions += 15;


  if (data.extraFeet && data.extraFeet > 0) {
    additions += Math.ceil(data.extraFeet / 20) * 10;
  }


  if (data.isSteep) additions += 15;

  // Priority
  if (data.isPriority) additions += 20;

  return additions;
};


const createProduct = async (data: CreateProductRequest, imageUrls: string[] ) => {
  console.log("Calculating price for data:", data);

  // Ensure we have userId for tracking purposes
  if (!data.userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required.");
  }

  const basePrice = getBasePrice(data.area);

  if (basePrice === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Custom quote area. Please contact support.");
  }

  let additionsPrice = 0;

  if (data.serviceType === "snow") {
    additionsPrice = calculateAdditionsPrice(data);
  }

  const totalPrice = basePrice + additionsPrice;

//   // Save to database and associate with the user
 const product =  await prisma.createProduct.create({
  data: {
    serviceType: data.serviceType || "snow",
    address: data.address || "Unknown Address", 
    location: data.location || "Unknown",        
    perimeter: data.perimeter || 0,              
    area: data.area,
    lat: isNaN(Number(data.lat)) ? 0 : Number(data.lat),  
    lng: isNaN(Number(data.lng)) ? 0 : Number(data.lng),  
    driveways: data.driveways || [],
    isCornerLot: data.isCornerLot || false,
    extraFeet: data.extraFeet || 0,
    isSteep: data.isSteep || false,
    isPriority: data.isPriority || false,
    basePrice: data.basePrice || 0,
    additionsPrice: data.additionsPrice || 0,
    totalPrice: data.totalPrice || 0,
    userId: data.userId,
    images: imageUrls || [], // Save images if provided
    providerId: data.providerId
  },
});


  return {
    product,
    address: data.address,
    location: data.location,
    basePrice,
    additionsPrice,
    totalPrice,
  };
};

const getAll = async (userId: string) => {
  const prices = await prisma.createProduct.findMany({
    where: { userId },
  });
  return prices.map((price) => ({
    id: price.id,
    address: price.address,
    location: price.location,
    serviceType: price.serviceType,
    perimeter: price.perimeter,
    area: price.area,
    driveways: price.driveways,
    isCornerLot: price.isCornerLot,
    extraFeet: price.extraFeet,
    isSteep: price.isSteep,
    isPriority: price.isPriority,
    basePrice: price.basePrice,
    additionsPrice: price.additionsPrice,
    totalPrice: price.totalPrice,
    images: price.images || [],
  }));
};


const getPriceById = async (id: string) => {
  const price = await prisma.createProduct.findUnique({
    where: { id },
  });
  if (!price) {
    throw new ApiError(httpStatus.NOT_FOUND, "Price calculation not found.");
  }
  return price;
};



const deleteProduct = async (id: string) => {
  const product = await prisma.createProduct.findUnique({
    where: { id },
  });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found.");
    }
    await prisma.createProduct.delete({
        where: { id },
    });
    return { message: "Product deleted successfully." };
}


const updateProduct = async ( data: CreateProductRequest, id: string,) => {
  const product = await prisma.createProduct.findUnique({
    where: { id },
  });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found.");
    }
    const updatedProduct = await prisma.createProduct.update({
        where: { id },
        data: {
            ...data,
            images: data.images || product.images, // Keep existing images if not provided
        },
    });
    return updatedProduct;
}

const updateProjectImage = async (providerId: string, imageUrls: string[], productId:string) => {
  const user = await prisma.user.findUnique({ where: { id: providerId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedProduct = await prisma.createProduct.update({
    where: { id: productId},
    data: {
      completedImages: { push: imageUrls }, 
      status: ProductStatus.COMPLETED  // Push new images to the existing array
    },
    
  });

  return updatedProduct;
};


export const ProductService = {
  createProduct,
  getPriceById,
  getAll,
  deleteProduct,
  updateProduct,
  updateProjectImage
};


