import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setCart } from '../features/cart/store/cartSlice';

export const UserSync: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cart = useSelector((state: RootState) => state.cart);
  const isInitialized = useRef(false);

  // 1. Unified Load Logic
  useEffect(() => {
    const storageKey = isAuthenticated && user ? `cart_v2_${user.id}` : 'cart_guest';
    const savedCart = localStorage.getItem(storageKey);
    
    if (savedCart) {
      try {
        dispatch(setCart(JSON.parse(savedCart)));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    
    // Mark as initialized so persistence can start
    setTimeout(() => {
      isInitialized.current = true;
    }, 100); 
  }, [isAuthenticated, user?.id, dispatch]);

  // 2. Persist Active Cart (Guard against overwriting before load)
  useEffect(() => {
    if (!isInitialized.current) return;

    const storageKey = isAuthenticated && user ? `cart_v2_${user.id}` : 'cart_guest';
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, isAuthenticated, user?.id]);

  return null;
};
