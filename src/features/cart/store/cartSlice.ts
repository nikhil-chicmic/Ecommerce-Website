import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartState } from '../types';
import type { Product } from '../../products/types';

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  isCartOpen: false
};

const calculateTotals = (state: CartState) => {
  state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
  state.totalAmount = state.items.reduce((total, item) => {
    const price = item.discountPercentage 
      ? item.price * (1 - item.discountPercentage / 100)
      : item.price;
    return total + (price * item.quantity);
  }, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<CartState>) {
      return { ...action.payload, isCartOpen: false };
    },
    addToCart(state, action: PayloadAction<Product>) {
      const existingItem = state.items.find(item => String(item.id) === String(action.payload.id));
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      calculateTotals(state);
    },
    removeFromCart(state, action: PayloadAction<string | number>) {
      state.items = state.items.filter(item => String(item.id) !== String(action.payload));
      calculateTotals(state);
    },
    updateQuantity(state, action: PayloadAction<{ id: string | number; quantity: number }>) {
      const item = state.items.find(item => String(item.id) === String(action.payload.id));
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => String(i.id) !== String(action.payload.id));
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      calculateTotals(state);
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
    closeCart(state) {
      state.isCartOpen = false;
    }
  },
});

export const { setCart, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
