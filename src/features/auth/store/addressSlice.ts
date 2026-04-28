import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../../lib/supabase';

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  isLoading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Address[];
  }
);

export const saveAddress = createAsyncThunk(
  'address/save',
  async (address: Omit<Address, 'id' | 'user_id' | 'is_default'> & { userId: string }) => {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: address.userId,
        full_name: address.full_name,
        phone_number: address.phone_number,
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: false
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Supabase Address Save Error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Address saved but not returned by database. Please refresh.');
    }
    
    return data as Address;
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setSelectedAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        if (action.payload.length > 0 && !state.selectedAddressId) {
          state.selectedAddressId = action.payload[0].id;
        }
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        state.addresses.unshift(action.payload);
        state.selectedAddressId = action.payload.id;
      });
  }
});

export const { setSelectedAddress } = addressSlice.actions;
export const addressReducer = addressSlice.reducer;
