import { apiClient } from '../../../api/axios';
import type { Product, ProductsResponse, ProductFilters } from '../types';

// Mock local storage integration for Admin products
const getCustomProducts = (): Product[] => {
  try {
    const custom = localStorage.getItem('custom_products');
    return custom ? JSON.parse(custom) : [];
  } catch {
    return [];
  }
};

export const productApi = {
  async getProducts(skip = 0, limit = 20, filters?: ProductFilters): Promise<ProductsResponse> {
    let url = `/products`;
    let params: any = { limit, skip };

    // If searching, dummyjson has a specific endpoint
    if (filters?.search) {
      url = `/products/search`;
      params = { q: filters.search, limit, skip };
    } else if (filters?.category && filters.category !== 'all') {
      url = `/products/category/${filters.category}`;
      // When filtering by category, dummyjson pagination might behave differently, but we pass them anyway
      params = { limit, skip };
    }

    const { data } = await apiClient.get<ProductsResponse>(url, { params });
    
    // Merge custom admin products logic
    const customProducts = getCustomProducts();
    let mergedProducts = [...customProducts, ...data.products];

    // Client-side filtering for custom products since DummyJSON doesn't know about them
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      mergedProducts = mergedProducts.filter(p => 
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    
    if (filters?.category && filters.category !== 'all') {
      mergedProducts = mergedProducts.filter(p => p.category === filters.category);
    }

    // Client-side sorting for all
    if (filters?.sortBy) {
      mergedProducts.sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
    }

    // Handle pagination manually for merged results if custom products exist
    // (Simplification for now: we just append custom products at the start)
    
    return {
      products: mergedProducts,
      total: data.total + customProducts.length,
      skip,
      limit,
    };
  },

  async getCategories(): Promise<string[]> {
    const { data } = await apiClient.get<any[]>('/products/categories');
    // DummyJSON returns objects now, let's map them to strings or just return strings if older API
    if (data && data.length > 0 && typeof data[0] === 'object') {
       return data.map((c: any) => c.slug);
    }
    return data as string[];
  },

  async getProductById(id: string): Promise<Product> {
    // Check custom first
    const custom = getCustomProducts().find(p => String(p.id) === String(id));
    if (custom) return custom;

    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  }
};
