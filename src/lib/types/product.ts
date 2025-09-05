import {
  ProductCollection,
  ProductSize,
  ProductStatus,
  ProductVolume,
} from "../enums/product.enums";

export interface Product {
  _id: string;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc: string;
  productImages: string[];
  productViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc: string;
  productImages: string[];
  productViews?: number;
}

export interface ProductUpdateInput {
  _id: string;
  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc?: string;
  productImages?: string[];
  existingImages?: string[];
  productViews?: number;
}

export interface ProductFormValues {
  productName: string;
  productPrice: string;
  productLeftCount: string;
  productCollection: ProductCollection;
  productSize?: ProductSize;
  productVolume?: ProductVolume;
  productDesc: string;
  existingUrls: string[];
  newFiles: File[];
}

export interface ProductsStat {
  total: number;
  available: number;
  unavailable: number;
}

