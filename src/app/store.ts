// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import reduxLogger from "redux-logger";
import DashboardPageReducer from '../screens/dashboardPage/slice';

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    //@ts-ignore
    getDefaultMiddleware().concat(reduxLogger),
  reducer: {
    dashboardPage: DashboardPageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
