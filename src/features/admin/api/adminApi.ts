import type { Product } from '../../products/types';
import { logger } from '../../../utils';

const CUSTOM_PRODUCTS_KEY = 'custom_products';

const getCustomProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCustomProducts = (products: Product[]) => {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adminApi = {
  async createProduct(productData: Omit<Product, 'id' | 'isCustom'>): Promise<Product> {
    await delay(600); // Simulate network
    
    const newProduct: Product = {
      ...productData,
      id: `custom_${Math.random().toString(36).substring(2, 9)}`,
      isCustom: true,
      images: productData.images || [productData.thumbnail],
    };

    const products = getCustomProducts();
    saveCustomProducts([newProduct, ...products]);
    
    logger.info('Admin created new product', newProduct);
    return newProduct;
  },

  async updateProduct(id: string | number, productData: Partial<Product>): Promise<Product> {
    await delay(600);
    
    const products = getCustomProducts();
    const index = products.findIndex(p => String(p.id) === String(id));
    
    if (index === -1) {
      throw new Error('Product not found in custom database. Cannot edit DummyJSON products directly.');
    }

    const updatedProduct = { ...products[index], ...productData };
    products[index] = updatedProduct;
    saveCustomProducts(products);

    logger.info('Admin updated product', updatedProduct);
    return updatedProduct;
  },

  async deleteProduct(id: string | number): Promise<boolean> {
    await delay(500);
    
    const products = getCustomProducts();
    const initialLength = products.length;
    const filtered = products.filter(p => String(p.id) !== String(id));
    
    if (filtered.length === initialLength) {
      throw new Error('Product not found or cannot be deleted.');
    }

    saveCustomProducts(filtered);
    logger.info(`Admin deleted product ${id}`);
    return true;
  }
};
