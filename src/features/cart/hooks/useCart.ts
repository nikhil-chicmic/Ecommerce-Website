import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../../../store';
import { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } from '../store/cartSlice';
import { cartApi } from '../api/cartApi';
import type { Product } from '../../products/types';

export const useCart = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const fullCartState = useSelector((state: RootState) => state.cart);
  const activeCartData = fullCartState.carts[fullCartState.activeUserKey] || { items: [], totalQuantity: 0, totalAmount: 0 };
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const syncMutation = useMutation({
    mutationFn: async ({ productId, quantity, isClear = false }: { productId?: string | number, quantity?: number, isClear?: boolean }) => {
      if (!isAuthenticated || !user) return;
      if (isClear) {
        await cartApi.clearCart(user.id);
      } else if (productId !== undefined && quantity !== undefined) {
        await cartApi.updateCartItem(user.id, productId, quantity);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    }
  });

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
    const newQuantity = (activeCartData.items.find(item => String(item.id) === String(product.id))?.quantity || 0) + 1;
    syncMutation.mutate({ productId: product.id, quantity: newQuantity });
  };

  const handleRemoveFromCart = (id: string | number) => {
    dispatch(removeFromCart(id));
    syncMutation.mutate({ productId: id, quantity: 0 });
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
    syncMutation.mutate({ productId: id, quantity });
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    syncMutation.mutate({ isClear: true });
  };

  return {
    ...activeCartData,
    isCartOpen: fullCartState.isCartOpen,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    toggleCart: () => dispatch(toggleCart()),
    closeCart: () => dispatch(closeCart()),
  };
};
