import { geminiService } from '../services/geminiService';
import { supabase } from '../../../lib/supabase';

export interface AIResponse {
  text: string;
  intent: 'search' | 'order' | 'chat' | 'reject';
  suggestedProducts?: any[];
}

export const aiApi = {
  // Main pipeline to process user intent and save history
  async processIntent(message: string, userId?: string): Promise<AIResponse> {
    // 1. Get structured intent and products from the service
    const geminiData = await geminiService.processCoPilotQuery(message);
    
    const suggestedProducts = geminiData.suggestedProducts || [];

    // 2. Save conversation to Supabase if user is logged in
    if (userId) {
      await this.saveChatHistory(userId, message, 'user', geminiData.intent);
      await this.saveChatHistory(
        userId, 
        geminiData.text, 
        'bot', 
        geminiData.intent, 
        suggestedProducts.length > 0 ? { products: suggestedProducts } : null
      );
    }

    return {
      text: geminiData.text,
      intent: geminiData.intent as AIResponse['intent'],
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
