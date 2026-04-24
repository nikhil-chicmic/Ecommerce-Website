import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } from '../store/cartSlice';
import type { Product } from '../../products/types';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state: RootState) => state.cart);

  return {
    ...cartState,
    addToCart: (product: Product) => dispatch(addToCart(product)),
    removeFromCart: (id: string | number) => dispatch(removeFromCart(id)),
    updateQuantity: (id: string | number, quantity: number) => dispatch(updateQuantity({ id, quantity })),
    clearCart: () => dispatch(clearCart()),
    toggleCart: () => dispatch(toggleCart()),
    closeCart: () => dispatch(closeCart()),
  };
};
