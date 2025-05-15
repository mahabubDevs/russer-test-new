import { ProductStatus } from "@prisma/client";

export interface CreateProductRequest {
  id: string;
  serviceType: "snow" | "lawn";
  address: string;
  location: string;
  lat ?: number;
  lng ?: number;
  perimeter: number;
  area: number;
  driveways?: ("1-car" | "2-car" | "3-car")[];
  isCornerLot?: boolean;
  extraFeet?: number;
  isSteep?: boolean;
  isPriority?: boolean;
  userId: string; // Add userId here
  images?: string[]; // Add images here
  
 

  basePrice: number;
  additionsPrice: number;
  totalPrice: number;

  status: ProductStatus;
  providerId: string; // Add providerId here
  completedImages?: string[]; // Add completedImages here
  createdAt?: Date;
}


export interface ProductResponse {
  address: string;
  location: string;
  basePrice: number;
  additionsPrice: number;
  totalPrice: number;
}
















