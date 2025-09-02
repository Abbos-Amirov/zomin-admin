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
      if (idx !== -1) state.products[idx] = p;
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
