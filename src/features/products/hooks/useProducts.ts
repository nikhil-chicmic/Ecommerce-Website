import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import type { ProductFilters } from '../types';

export const useProducts = (skip: number, limit: number, filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', skip, limit, filters],
    queryFn: () => productApi.getProducts(skip, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });
};
