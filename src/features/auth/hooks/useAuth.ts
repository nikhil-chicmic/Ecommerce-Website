import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { loginStart, loginSuccess, loginFailure, logout, clearError } from '../store/authSlice';
import { authApi } from '../api/authApi';
import type { LoginCredentials, RegisterCredentials } from '../types';
import { logger } from '../../../utils';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch(loginStart());
      const response = await authApi.login(credentials);
      dispatch(loginSuccess(response));
      return true;
    } catch (error: any) {
      logger.error('Login failed', error);
      dispatch(loginFailure(error.message || 'Login failed'));
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch(loginStart());
      const response = await authApi.register(credentials);
      dispatch(loginSuccess(response));
      return true;
    } catch (error: any) {
      logger.error('Registration failed', error);
      dispatch(loginFailure(error.message || 'Registration failed'));
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch({ type: 'cart/clearCart' });
    dispatch({ type: 'order/clearOrder' });
  };

  const resetError = () => {
    dispatch(clearError());
  };

  return {
    ...authState,
    login,
    register,
    logout: handleLogout,
    resetError,
  };
};
