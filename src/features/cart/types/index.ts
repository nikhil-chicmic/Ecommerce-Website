import type { Product } from '../../products/types';

export interface CartItem extends Product {
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

export interface CartState {
  carts: Record<string, CartData>; // Keyed by user email or 'guest'
  isCartOpen: boolean;
  activeUserKey: string; // The currently active user's email, or 'guest'
}
