import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { syncCart } from '../features/cart/store/cartSlice';
import type { AppDispatch } from '../store';

/**
 * UserSync Component
 * 
 * This component acts as a background manager for cart synchronization.
 * It detects when a user logs in and triggers the cloud-sync thunk 
 * to merge the local guest cart with the user's Supabase account.
 */
export const UserSync: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Trigger the production-grade sync thunk
      dispatch(syncCart(user.id));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  return null;
};
