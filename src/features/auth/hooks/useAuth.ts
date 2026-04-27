import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../../../store';
import { loginStart, loginSuccess, loginFailure, logout, clearError } from '../store/authSlice';
import { authApi } from '../api/authApi';
import type { LoginCredentials, RegisterCredentials } from '../types';
import { logger } from '../../../utils';
import { useToast } from '../../../context/ToastContext';

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const authState = useSelector((state: RootState) => state.auth);
  const toast = useToast();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      queryClient.setQueryData(['auth_user'], data.user);
      toast.success('Login Successful', `Welcome back, ${data.user.name.split(' ')[0]}!`);
    },
    onError: (error: any) => {
      logger.error('Login failed', error);
      let errorMsg = error.message || 'Login failed';
      if (errorMsg.toLowerCase().includes('invalid login credentials')) {
        errorMsg = 'Invalid email or password.';
      }
      dispatch(loginFailure(errorMsg));
      toast.error('Authentication Error', errorMsg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      queryClient.setQueryData(['auth_user'], data.user);
      toast.success('Account Created', 'Your account has been successfully created.');
    },
    onError: (error: any) => {
      logger.error('Registration failed', error);
      let errorMsg = error.message || 'Registration failed';
      if (errorMsg.toLowerCase().includes('user already registered')) {
        errorMsg = 'An account with this email already exists.';
      }
      dispatch(loginFailure(errorMsg));
      toast.error('Registration Error', errorMsg);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: () => authApi.loginWithGoogle(),
    onError: (error: any) => {
      logger.error('Google login failed', error);
      dispatch(loginFailure(error.message || 'Google login failed'));
      toast.error('Google Authentication Error', error.message || 'Could not authenticate with Google.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      dispatch(logout());
      dispatch({ type: 'cart/clearCart' });
      dispatch({ type: 'order/clearOrder' });
      queryClient.clear();
      toast.info('Signed Out', 'You have been safely logged out.');
    },
    onError: (error: any) => {
      logger.error('Logout failed', error);
      toast.error('Sign Out Error', 'An error occurred while logging out.');
    },
  });

  const resetError = () => {
    dispatch(clearError());
  };

  return {
    ...authState,
    isLoading: loginMutation.isPending || registerMutation.isPending || googleLoginMutation.isPending || authState.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    resetError,
  };
};
