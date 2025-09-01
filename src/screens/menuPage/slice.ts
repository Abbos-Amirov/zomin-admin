import { createSlice } from "@reduxjs/toolkit";
import { MenuPageState } from "../../lib/types/screen";

const initialState: MenuPageState = {
  products: [],
};

const dashboardPageSlice = createSlice({
  name: "menuPage",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
  },
});

export const { setProducts } = dashboardPageSlice.actions;

const MenuPageReducer = dashboardPageSlice.reducer;
export default MenuPageReducer;
