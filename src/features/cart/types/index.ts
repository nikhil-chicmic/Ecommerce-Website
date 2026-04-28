import type { Product } from '../../products/types';

export interface CartItem {
  id: string | number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
  // Optional extra metadata from Product
  description?: string;
  category?: string;
  discountPercentage?: number;
}

export interface CartData {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}
