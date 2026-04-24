import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../types';

interface OrderState {
  currentOrder: Order | null;
  isProcessing: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  isProcessing: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setProcessing(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setCurrentOrder(state, action: PayloadAction<Order>) {
      state.currentOrder = action.payload;
      state.error = null;
    },
    updateOrderStatus(state, action: PayloadAction<{ status: Order['status'], paymentId?: string }>) {
      if (state.currentOrder) {
        state.currentOrder.status = action.payload.status;
        if (action.payload.paymentId) {
          state.currentOrder.paymentId = action.payload.paymentId;
        }
      }
    },
    clearOrder(state) {
      state.currentOrder = null;
      state.error = null;
      state.isProcessing = false;
    }
  }
});

export const { setProcessing, setError, setCurrentOrder, updateOrderStatus, clearOrder } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
