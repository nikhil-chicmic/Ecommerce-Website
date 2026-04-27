import { supabase } from '../../../lib/supabase';
import type { CartState } from '../types';

export const cartApi = {
  async getCart(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async updateCartItem(userId: string, productId: string | number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', String(productId));
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: userId, product_id: String(productId), quantity },
          { onConflict: 'user_id, product_id' }
        );
      if (error) throw error;
    }
  },

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }
};
