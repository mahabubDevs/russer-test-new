import { Request, Response } from "express";
import { ProductService} from "./Product.service";
import { fileUploader } from "../../../helpars/fileUploader";
import  haversine  from "../../../shared/haversine";
import prisma from "../../../shared/prisma";
import { ProductStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import { userService } from "../User/user.services";

// PriceCalculation করতে গেলে UserId সহ ডেটা নিতে হবে
const createProduct = async (req: Request, res: Response) => {
  console.log("calculatePrice", req.body);


  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
     // Parse the JSON string from "data"
  
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
 
  try {
    // এখানে আমরা req.body তে userId পাঠানোর কথা বলছি
    // আগে থেকেই userId req.body তে পাস করা হলে, তা priceCalculation এ সঠিকভাবে অন্তর্ভুক্ত হবে

    console.log("calculatePrice try", req.body);

    // PriceCalculation করার সময় req.body তে userId থাকতে হবে
    const result = await ProductService.createProduct(req.body,imageUrls);
    console.log("calculatePrice result", result);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
};


const getAllPrices = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getAll(req.params.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
}

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  } 
}

const updateProduct = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log("updateProduct", req.body);
    const body = JSON.parse(req.body.data); // Parse the JSON string from "data"
    // const body = req.body; // Assuming the data is already in JSON format
    console.log("updateProduct body", body);
  
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
  
    const result = await ProductService.updateProduct(userPayload, req.params.id);
  
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
}

// Provider: Get nearby products
 const getNearbyProducts = async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  console.log("lat", lat)
  console.log("lng", lng)
  console.log("body", req.query)

  const all = await prisma.createProduct.findMany({
    where: { status: ProductStatus.PENDING },
  });

  const filtered = all.filter((p) =>
    haversine(
      { lat: Number(lat), lng: Number(lng) },
      { lat: p.lat, lng: p.lng },
      5000 // 5 km radius
    )
  );

  res.json(filtered);
};

// Provider: Accept product
 const acceptProduct = async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const productId = req.params.id;

  const product = await prisma.createProduct.update({
    where: { id: productId },
    data: {
      providerId,
      status: ProductStatus.ACCEPTED,
    },
  });

  res.json({ product });
};

// Provider: Complete product
 const completeProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { completedImages } = req.body;

  const updated = await prisma.createProduct.update({
    where: { id: productId },
    data: {
      status: ProductStatus.COMPLETED,
      completedImages,
    },
  });

  res.json({ message: 'Project marked as completed', updated });
};

// image upload
const updateProjectImage = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const providerId = req.user.id
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
  const user = await ProductService.updateProjectImage (providerId, imageUrls, productId);

  res.status(200).json({
    success: true,
    message: "successfully updated user document!",
    data: user,
  });
});




// Customer: Get my created products
 const getMyProducts = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const myProducts = await prisma.createProduct.findMany({
    where: { userId },
  });

  res.json(myProducts);
};


const rejectProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const providerId = req.user.id; // ✅ নিশ্চিত করুন middleware দিয়ে req.user আছে

  try {
    const product = await prisma.createProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.status !== 'PENDING') {
      return res.status(400).json({ error: 'Product is not pending' });
    }

    // ✅ একই provider আগে reject করেছে কিনা, চেক করুন
    const alreadyRejected = await prisma.rejectedProduct.findFirst({
      where: {
        productId,
        providerId,
      },
    });

    if (alreadyRejected) {
      return res.status(400).json({ error: 'You have already rejected this product' });
    }

    // ✅ RejectedProduct টেবিলে এন্ট্রি তৈরি করুন
    await prisma.rejectedProduct.create({
      data: {
        productId,
        providerId,
      },
    });

    return res.json({ message: 'Product rejected successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

const getPendingProducts = async (req: Request, res: Response) => {
  const providerId = req.user.id;

  try {
    const products = await prisma.createProduct.findMany({
      where: {
        status: 'PENDING',
        NOT: {
          rejectedBy: {
            some: {
              providerId: providerId,
            },
          },
        },
      },
    });

    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};




export const ProductController = {
  createProduct,
  getAllPrices,
  deleteProduct,
  updateProduct,
  getNearbyProducts,
  acceptProduct,
  rejectProduct,
  completeProduct,
  getMyProducts,
  getPendingProducts,
  updateProjectImage

};


// const createProduct = catchAsync (async (req:Request, res:Response) => {
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   const body = JSON.parse(req.body.data);
//   console.log("createProduct body", body);
//   let imageUrls: string[] = [];

//   if(files?.images && files.images.length > 0 ) {
//     const uploads = await Promise.all(
//       files.images.map(async (file) =>{
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return uploaded.Location;
//       })
//     );
//     imageUrls = uploads;
//   }



// const userPayload = {
//   ...body,
//   images: imageUrls, // Attach uploaded image URLs
// };


// const product = await ProductService.createProduct(userPayload);
// res.status(201).json({
//   success: true,
//   message: "Product created successfully!",
//   data: product,
// });
// });

































