import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '../store';
import { setCart, setActiveUser } from '../features/cart/store/cartSlice';
import { cartApi } from '../features/cart/api/cartApi';
import { productApi } from '../features/products/api/productApi';

export const UserSync: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isHydrating = useRef(false);

  // Switch the active cart bucket when the user changes
  useEffect(() => {
    dispatch(setActiveUser(isAuthenticated && user?.email ? user.email : 'guest'));
  }, [isAuthenticated, user?.email, dispatch]);

  // Fetch cart from Supabase when logged in
  const { data: serverCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => cartApi.getCart(user!.id),
    enabled: !!isAuthenticated && !!user?.id,
  });

  // Hydrate Redux state from server data
  useEffect(() => {
    if (serverCart && !isHydrating.current) {
      isHydrating.current = true;
      
      const hydrate = async () => {
        const hydratedItems = await Promise.all(
          serverCart.map(async (item: any) => {
            try {
              const product = await productApi.getProductById(item.product_id);
              return { ...product, quantity: item.quantity };
            } catch (e) {
              console.error(`Failed to hydrate product ${item.product_id}`, e);
              return null;
            }
          })
        );

        const validItems = hydratedItems.filter(i => i !== null);
        
        dispatch(setCart({
          items: validItems,
          totalQuantity: validItems.reduce((acc, i) => acc + i.quantity, 0),
          totalAmount: validItems.reduce((acc, i) => {
             const price = i.discountPercentage 
              ? i.price * (1 - i.discountPercentage / 100)
              : i.price;
            return acc + (price * i.quantity);
          }, 0),
        }));
        
        isHydrating.current = false;
      };

      hydrate();
    }
  }, [serverCart, dispatch]);

  return null;
};
