import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LinkDineInOrderView } from "../../lib/linkDineInOrderMapping";
import { DashboardPageState } from "../../lib/types/screen";

const initialState: DashboardPageState = {
  orderStatis: null,
  tableStatus: [],
  productStatus: [],
  linkDinePendingAckIds: [],
  linkDineInOrders: [],
  linkDineAlertOpen: false,
  linkDineAlertOrders: [],
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
    setLinkDinePendingAckIds: (state, action: PayloadAction<string[]>) => {
      state.linkDinePendingAckIds = Array.isArray(action.payload) ? action.payload : [];
    },
    setLinkDineInOrders: (state, action: PayloadAction<LinkDineInOrderView[]>) => {
      state.linkDineInOrders = Array.isArray(action.payload) ? action.payload : [];
    },
    openLinkDineAlert: (state, action: PayloadAction<LinkDineInOrderView[]>) => {
      state.linkDineAlertOrders = Array.isArray(action.payload) ? action.payload : [];
      state.linkDineAlertOpen = state.linkDineAlertOrders.length > 0;
    },
    closeLinkDineAlert: (state) => {
      state.linkDineAlertOpen = false;
      state.linkDineAlertOrders = [];
    },
  },
});

export const {
  setOrderStatis,
  setTableStatus,
  setProductStatus,
  setLinkDinePendingAckIds,
  setLinkDineInOrders,
  openLinkDineAlert,
  closeLinkDineAlert,
} = dashboardPageSlice.actions;

const DashboardPageReducer = dashboardPageSlice.reducer;
export default DashboardPageReducer;
