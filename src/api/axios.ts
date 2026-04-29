import axios from 'axios';
import { ENV } from '../config/env.ts';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for logging or auth token injection if needed later
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && token !== 'mock_jwt_token_12345') { // We ignore our dummy token for dummyjson
    // config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
