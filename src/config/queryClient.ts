import { QueryClient } from '@tanstack/react-query';
import { logger } from '../utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        logger.error('Global Mutation Error:', error);
      },
    },
  },
});
