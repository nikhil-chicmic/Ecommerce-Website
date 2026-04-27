import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartState, CartData } from '../types';
import type { Product } from '../../products/types';

const initialCartData: CartData = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const initialState: CartState = {
  carts: {
    guest: initialCartData,
  },
  isCartOpen: false,
  activeUserKey: 'guest',
};

const getActiveCart = (state: CartState): CartData => {
  const key = state.activeUserKey;
  if (!state.carts[key]) {
    state.carts[key] = { items: [], totalQuantity: 0, totalAmount: 0 };
  }
  return state.carts[key];
};

const calculateTotals = (cart: CartData) => {
  cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.totalAmount = cart.items.reduce((total, item) => {
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
    setActiveUser(state, action: PayloadAction<string | null>) {
      state.activeUserKey = action.payload || 'guest';
    },
    setCart(state, action: PayloadAction<CartData>) {
      state.carts[state.activeUserKey] = action.payload;
    },
    addToCart(state, action: PayloadAction<Product>) {
      const cart = getActiveCart(state);
      const existingItem = cart.items.find(item => String(item.id) === String(action.payload.id));
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ ...action.payload, quantity: 1 });
      }
      calculateTotals(cart);
    },
    removeFromCart(state, action: PayloadAction<string | number>) {
      const cart = getActiveCart(state);
      cart.items = cart.items.filter(item => String(item.id) !== String(action.payload));
      calculateTotals(cart);
    },
    updateQuantity(state, action: PayloadAction<{ id: string | number; quantity: number }>) {
      const cart = getActiveCart(state);
      const item = cart.items.find(item => String(item.id) === String(action.payload.id));
      if (item) {
        if (action.payload.quantity <= 0) {
          cart.items = cart.items.filter(i => String(i.id) !== String(action.payload.id));
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      calculateTotals(cart);
    },
    clearCart(state) {
      const cart = getActiveCart(state);
      cart.items = [];
      cart.totalQuantity = 0;
      cart.totalAmount = 0;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
    closeCart(state) {
      state.isCartOpen = false;
    }
  },
});

export const { setActiveUser, setCart, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
