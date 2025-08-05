// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice'; // adjust if path differs

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
