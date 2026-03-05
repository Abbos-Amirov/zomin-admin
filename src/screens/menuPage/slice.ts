import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuPageState } from "../../lib/types/screen";
import { Product } from "../../lib/types/product";

const initialState: MenuPageState = {
  products: [],
};

const menuPageSlice = createSlice({
  name: "menuPage",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },

    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload);
    },

    updateProduct: (state, action: PayloadAction<Product>) => {
      const p = action.payload;
      const idx = state.products.findIndex((x) => x._id === p._id);
      if (idx !== -1) {
        const prev = state.products[idx];
        const incoming = p as Product & {
          existingImages?: string[];
          product_images?: string[];
        };
        const rawImages = Array.isArray(incoming.productImages)
          ? incoming.productImages
          : Array.isArray(incoming.existingImages)
          ? incoming.existingImages
          : Array.isArray(incoming.product_images)
          ? incoming.product_images
          : [];
        const normalizedImages = rawImages
          .map((img) => String(img ?? "").trim())
          .filter(Boolean);

        state.products[idx] = {
          ...prev,
          ...p,
          // Fallback update endpoint sometimes returns partial payload.
          // Keep previous image list if backend does not send it back.
          productImages:
            normalizedImages.length > 0 ? normalizedImages : prev.productImages,
        };
      }
    },

    removeProduct: (state, action: PayloadAction<Product>) => {
      const p = action.payload;
      state.products = state.products.filter((x) => x._id !== p._id);
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
} = menuPageSlice.actions;

export default menuPageSlice.reducer;
