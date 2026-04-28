import axios from 'axios';
import { geminiService } from '../services/geminiService';
import { supabase } from '../../../lib/supabase';

export interface AIResponse {
  text: string;
  intent: 'search' | 'order' | 'chat';
  suggestedProducts?: any[];
}

export const aiApi = {
  // Main pipeline to process user intent and save history
  async processIntent(message: string, userId?: string): Promise<AIResponse> {
    // 1. Get structured intent from Gemini
    const geminiData = await geminiService.processMessage(message);
    
    let suggestedProducts = [];

    // 2. If intent is search, fetch real products from API
    if (geminiData.intent === 'search' && geminiData.query) {
      try {
        const response = await axios.get(`https://dummyjson.com/products/search?q=${geminiData.query}&limit=3`);
        suggestedProducts = response.data.products;
      } catch (err) {
        console.error('Product fetch error in AI pipeline:', err);
      }
    }

    // 3. Save conversation to Supabase if user is logged in
    if (userId) {
      await this.saveChatHistory(userId, message, 'user', geminiData.intent);
      await this.saveChatHistory(
        userId, 
        geminiData.response, 
        'bot', 
        geminiData.intent, 
        suggestedProducts.length > 0 ? { products: suggestedProducts } : null
      );
    }

    return {
      text: geminiData.response,
      intent: geminiData.intent,
      suggestedProducts
    };
  },

  async saveChatHistory(userId: string, message: string, sender: 'user' | 'bot', intent?: string, metadata?: any) {
    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        sender,
        message,
        intent,
        metadata
      });
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  },

  async getChatHistory(userId: string) {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) throw error;
    return data;
  }
};
