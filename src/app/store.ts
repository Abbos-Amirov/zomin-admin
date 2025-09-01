// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import reduxLogger from "redux-logger";
import DashboardPageReducer from "../screens/dashboardPage/slice";
import MenuPageReducer from "../screens/menuPage/slice";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    //@ts-ignore
    getDefaultMiddleware().concat(reduxLogger),
  reducer: {
    dashboardPage: DashboardPageReducer,
    menuPage: MenuPageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
