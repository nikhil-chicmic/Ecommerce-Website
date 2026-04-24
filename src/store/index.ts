import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { ENV } from '../config/env';
import { authReducer } from '../features/auth/store/authSlice';
import { cartReducer } from '../features/cart/store/cartSlice';
import { orderReducer } from '../features/payment/store/orderSlice';
import { aiReducer } from '../features/ai/store/aiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  order: orderReducer,
  ai: aiReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: ENV.IS_DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
