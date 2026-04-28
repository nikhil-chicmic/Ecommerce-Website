import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../../lib/supabase';
import type { CartState, CartItem } from '../types';

const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,
};

// --- ASYNC THUNKS ---

export const syncCart = createAsyncThunk(
  'cart/sync',
  async (userId: string, { getState }) => {
    const state = getState() as { cart: CartState };
    const guestItems = state.cart.items;

    // 1. Fetch current items from server
    const { data: serverItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    // 2. Determine if we should perform a merge or just a fetch
    // If the server has items, we generally trust the server as the source of truth
    // unless the local state has items that are NOT on the server.
    const mergedMap = new Map();
    const serverHasItems = (serverItems || []).length > 0;
    
    // Always start with server items
    (serverItems || []).forEach(item => {
      mergedMap.set(String(item.product_id), Number(item.quantity));
    });

    // Only merge guest items if this is a "Login Transition" 
    // or if the server is currently empty and we have local data.
    // We detect this by checking if the local items are different from server items
    if (guestItems.length > 0) {
      let needsMerge = false;
      
      guestItems.forEach(item => {
        const serverQty = mergedMap.get(String(item.id));
        // If local has something server doesn't, or local has DIFFERENT quantity, we sync it up
        if (serverQty === undefined || serverQty !== item.quantity) {
          needsMerge = true;
          // For professional merging: we take the HIGHER quantity or sum them
          // Here we take the sum to ensure user doesn't lose items they added as guest
          const finalQty = (serverQty || 0) + item.quantity;
          mergedMap.set(String(item.id), finalQty);
        }
      });

      // 3. Update server ONLY if we actually merged new data
      if (needsMerge) {
        const upsertData = Array.from(mergedMap.entries()).map(([pid, qty]) => ({
          user_id: userId,
          product_id: pid,
          quantity: qty
        }));
        await supabase.from('cart_items').upsert(upsertData, { onConflict: 'user_id, product_id' });
      }
    }

    // 4. Fetch FULL DETAILS for all items in the final cart
    // Filter out 'undefined' or null IDs to prevent 404s
    const finalProductIds = Array.from(mergedMap.keys()).filter(pid => pid && pid !== 'undefined');
    
    const hydratedItems = await Promise.all(
      finalProductIds.map(async (pid) => {
        try {
          const response = await fetch(`https://dummyjson.com/products/${pid}`);
          if (!response.ok) throw new Error('Product not found');
          const product = await response.json();
          return {
            id: String(pid),
            title: product.title,
            price: Number(product.price),
            thumbnail: product.thumbnail,
            quantity: Number(mergedMap.get(pid))
          } as CartItem;
        } catch (err) {
          console.error(`Failed to hydrate product ${pid}:`, err);
          return null;
        }
      })
    );

    return hydratedItems.filter((item): item is CartItem => item !== null);
  }
);

export const updateCartItemRemote = createAsyncThunk(
  'cart/updateRemote',
  async ({ userId, productId, quantity, deleteItem = false }: { userId: string, productId: string, quantity: number, deleteItem?: boolean }) => {
    if (deleteItem || quantity <= 0) {
      await supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId);
      return { productId, delete: true };
    }

    await supabase.from('cart_items').upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: 'user_id, product_id' }
    );
    
    return { productId, quantity };
  }
);

export const clearCartRemote = createAsyncThunk(
  'cart/clearRemote',
  async (userId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return userId;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      const product = action.payload;
      const existingItem = state.items.find(item => String(item.id) === String(product.id));
      const quantityToAdd = Number(product.quantity) || 1;

      if (existingItem) {
        existingItem.quantity = (Number(existingItem.quantity) || 0) + quantityToAdd;
      } else {
        state.items.push({
          id: product.id,
          title: product.title || product.name || 'Unknown Product',
          price: Number(product.price) || 0,
          thumbnail: product.thumbnail || product.image || '',
          quantity: quantityToAdd
        });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ id: string | number; quantity: number }>) => {
      const item = state.items.find(item => String(item.id) === String(action.payload.id));
      if (item) {
        const newQuantity = Number(action.payload.quantity);
        if (newQuantity <= 0) {
          state.items = state.items.filter(i => String(i.id) !== String(action.payload.id));
        } else {
          item.quantity = newQuantity;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to sync cart';
      })
      // Clear cart on logout
      .addMatcher(
        (action) => action.type === 'auth/logout',
        (state) => {
          state.items = [];
          state.isOpen = false;
        }
      );
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCart, openCart, closeCart, toggleCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
