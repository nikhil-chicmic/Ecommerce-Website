import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../products/types';

interface AIBehaviorContext {
  viewedProductIds: string[];
  lastSearchQueries: string[];
  cartActionHistory: { action: 'add' | 'remove'; productId: string; timestamp: number }[];
  sessionStartTime: number;
}

interface AIState {
  context: AIBehaviorContext;
  isCopilotVisible: boolean;
  activeReasoning: string | null;
  chatHistory: { 
    role: 'user' | 'model'; 
    content: string; 
    timestamp: number;
    suggestedProducts?: Product[];
  }[];
}

const initialState: AIState = {
  context: {
    viewedProductIds: [],
    lastSearchQueries: [],
    cartActionHistory: [],
    sessionStartTime: Date.now(),
  },
  isCopilotVisible: false,
  activeReasoning: null,
  chatHistory: [],
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    trackProductView(state, action: PayloadAction<string>) {
      if (!state.context.viewedProductIds.includes(action.payload)) {
        state.context.viewedProductIds.push(action.payload);
      }
    },
    trackSearch(state, action: PayloadAction<string>) {
      state.context.lastSearchQueries.push(action.payload);
      if (state.context.lastSearchQueries.length > 5) {
        state.context.lastSearchQueries.shift();
      }
    },
    trackCartAction(state, action: PayloadAction<{ action: 'add' | 'remove'; productId: string }>) {
      state.context.cartActionHistory.push({
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    addChatMessage(state, action: PayloadAction<{ role: 'user' | 'model'; content: string; suggestedProducts?: Product[] }>) {
      state.chatHistory.push({
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    toggleCopilot(state) {
      state.isCopilotVisible = !state.isCopilotVisible;
    },
    setReasoning(state, action: PayloadAction<string | null>) {
      state.activeReasoning = action.payload;
    },
  },
});

export const { 
  trackProductView, 
  trackSearch, 
  trackCartAction, 
  addChatMessage, 
  toggleCopilot,
  setReasoning 
} = aiSlice.actions;

export const aiReducer = aiSlice.reducer;
