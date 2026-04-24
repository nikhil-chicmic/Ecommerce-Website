import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { Product } from '../../products/types';

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'isCustom'>) => adminApi.createProduct(data),
    onSuccess: () => {
      // Instantly invalidate product queries so the store app updates
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Product> }) => 
      adminApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', String(variables.id)] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
