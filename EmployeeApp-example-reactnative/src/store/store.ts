import {configureStore} from '@reduxjs/toolkit';
import authSlice from './authSlice';
import orderSlice from './orderSlice';
import productSlice from './productSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: orderSlice,
    products: productSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;