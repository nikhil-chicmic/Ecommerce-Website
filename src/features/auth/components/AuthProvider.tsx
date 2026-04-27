import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../../../lib/supabase';
import { loginSuccess, logout } from '../store/authSlice';
import { authApi } from '../api/authApi';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authApi.getCurrentUser().then(user => {
          if (user) {
            dispatch(loginSuccess({ user, token: session.access_token }));
          }
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authApi.getCurrentUser();
        if (user) {
          dispatch(loginSuccess({ user, token: session.access_token }));
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch(logout());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};
