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
    addOrder: (state, action) => {
      const order = action.payload;
      const exists = state.orders.some((o: { _id?: unknown }) => String(o._id) === String(order._id));
      if (!exists) state.orders = [order, ...state.orders];
    },
  },
});

export const { setOrders, addOrder } = ordersPageSlice.actions;

export default ordersPageSlice.reducer;
