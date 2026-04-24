export interface Product {
  id: string | number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  isCustom?: boolean; // Identifies admin-created products
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating-desc';
}
