import { createSlice } from "@reduxjs/toolkit";
import { DashboardPageState } from "../../lib/types/screen";

const initialState: DashboardPageState = {
  orderStatis: null,
  tableStatus: [],
  topSellingItems: [],
  ordersByCategory: [],
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
    setTopSellingItems: (state, action) => {
      state.topSellingItems = action.payload;
    },
    setOrdersByCategory: (state, action) => {
      state.ordersByCategory = action.payload;
    },
  },
});

export const { setOrderStatis, setTableStatus, setTopSellingItems,setOrdersByCategory } =
  dashboardPageSlice.actions;

const DashboardPageReducer = dashboardPageSlice.reducer;
export default DashboardPageReducer;
