import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import localforage from 'localforage';
import { ENV } from '../config/env';
import { authReducer } from '../features/auth/store/authSlice';
import { cartReducer } from '../features/cart/store/cartSlice';
import { orderReducer } from '../features/payment/store/orderSlice';
import { aiReducer } from '../features/ai/store/aiSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: localforage,
  whitelist: ['cart', 'auth'], // Only persist cart and auth state
};

import { addressReducer } from '../features/auth/store/addressSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  order: orderReducer,
  ai: aiReducer,
  address: addressReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: ENV.IS_DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
