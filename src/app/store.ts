// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import reduxLogger from "redux-logger";
import DashboardPageReducer from "../screens/dashboardPage/slice";
import MenuPageReducer from "../screens/menuPage/slice";
import OrdersPageReducer from "../screens/ordersPage/slice";
import UsersPageReducer from "../screens/usersPage/slice";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    //@ts-ignore
    getDefaultMiddleware().concat(reduxLogger),
  reducer: {
    dashboardPage: DashboardPageReducer,
    menuPage: MenuPageReducer,
    ordersPage: OrdersPageReducer,
    usersPage: UsersPageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
