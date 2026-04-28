import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../../store';
import { 
  addToCart as addToCartAction, 
  removeFromCart as removeFromCartAction, 
  updateQuantity as updateQuantityAction, 
  clearCart as clearCartAction, 
  toggleCart, 
  closeCart, 
  updateCartItemRemote,
  openCart
} from '../store/cartSlice';

/**
 * useCart Hook
 * 
 * Provides a unified interface for cart operations.
 */
export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const cartState = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Force empty items for guest users as per requirements
  const items = isAuthenticated ? (cartState?.items || []) : [];
  
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  const addToCart = (product: any) => {
    // Redirect guest users to login screen
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(addToCartAction(product));
    
    if (user?.id) {
      const existing = items.find(i => String(i.id) === String(product.id));
      const newQuantity = (existing?.quantity || 0) + 1;
      dispatch(updateCartItemRemote({ userId: user.id, productId: String(product.id), quantity: newQuantity }));
    }
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (!isAuthenticated) return;

    dispatch(updateQuantityAction({ id: String(id), quantity }));
    
    if (user?.id) {
      dispatch(updateCartItemRemote({ userId: user.id, productId: String(id), quantity }));
    }
  };

  const removeFromCart = (id: string | number) => {
    if (!isAuthenticated) return;

    dispatch(removeFromCartAction(String(id)));
    
    if (user?.id) {
      dispatch(updateCartItemRemote({ userId: user.id, productId: String(id), quantity: 0, deleteItem: true }));
    }
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  return {
    items, 
    isOpen: cartState?.isOpen || false, 
    totalAmount,
    isLoading: cartState?.isLoading || false,
    error: cartState?.error || null,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart: () => dispatch(toggleCart()),
    closeCart: () => dispatch(closeCart()),
    openCart: () => dispatch(openCart()),
  };
};
