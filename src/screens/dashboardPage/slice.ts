import { createSlice } from "@reduxjs/toolkit";
import { DashboardPageState } from "../../lib/types/screen";

const initialState: DashboardPageState = {
  orderStatis: null,
  tableStatus: [],
  productStatus: [],
};

const dashboardPageSlice = createSlice({
  name: "dashboardPage",
  initialState,
  reducers: {
    setOrderStatis: (state, action) => {
      state.orderStatis = action.payload;
    },
    setTableStatus: (state, action) => {
      state.tableStatus = action.payload;
    },
    setProductStatus: (state, action) => {
      state.productStatus = action.payload;
    },
  },
});

export const { setOrderStatis, setTableStatus, setProductStatus } =
  dashboardPageSlice.actions;

const DashboardPageReducer = dashboardPageSlice.reducer;
export default DashboardPageReducer;
