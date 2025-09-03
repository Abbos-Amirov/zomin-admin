import { createSlice } from "@reduxjs/toolkit";
import { OrdersPageState } from "../../lib/types/screen";

const initialState: OrdersPageState = {
  orders: [],
};

const ordersPageSlice = createSlice({
  name: "ordersPage",
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
  },
});

export const { setOrders } = ordersPageSlice.actions;

export default ordersPageSlice.reducer;
