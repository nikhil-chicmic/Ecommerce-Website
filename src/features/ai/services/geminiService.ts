import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../../../config/env';

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.0-flash-lite";

const SYSTEM_PROMPT = `
You are the Lumina Concierge, an elite personal shopping strategist. 
Your goal is to understand exactly what the user wants and return a structured JSON response.

DIRECTIONS:
1. Always respond in valid JSON format.
2. Detect the user's intent:
   - "search": User is looking for products.
   - "order": User is asking about their order history.
   - "chat": General conversation.

JSON STRUCTURE:
{
  "intent": "search" | "order" | "chat",
  "query": "search term if searching",
  "reasoning": "1-sentence internal logic why you gave this answer",
  "response": "A professional, helpful message",
  "suggestedProducts": [] 
}
`;

export const geminiService = {
  async processMessage(userMessage: string) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent([SYSTEM_PROMPT, userMessage]);
      const text = result.response.text();
      
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) throw new Error('Invalid AI response');
      
      return JSON.parse(text.substring(startIdx, endIdx + 1));
    } catch (error) {
      console.error('Lumina Concierge Sync Error:', error);
      // Fallback for 404 or Quota issues
      return { 
        intent: 'chat', 
        query: '', 
        reasoning: 'System fallback due to connectivity issues.',
        response: "I'm having a brief synchronization moment. Please try again!" 
      };
    }
  },

  async getProductInsights(product: any) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `
        You are a luxury shopping consultant. Analyze this product and return a JSON object:
        Product: ${product.title}
        Description: ${product.description}

        JSON Structure:
        {
          "summary": "2-sentence high-end summary",
          "pros": ["advantage 1", "advantage 2", "advantage 3"],
          "cons": ["consideration 1", "consideration 2"],
          "fitReason": "Why this fits a premium lifestyle"
        }
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      return JSON.parse(text.substring(startIdx, endIdx + 1));
    } catch (error) {
      return {
        summary: "An elite choice for the discerning collector. Part of our exclusive Lumina selection.",
        pros: ["Premium Craftsmanship", "Limited Availability", "Timeless Design"],
        cons: ["High Demand", "Selective Stock"],
        fitReason: "Matches your preference for high-quality, verified products."
      };
    }
  },

  // Alias for Sidebar with full object support
  async processCoPilotQuery(message: string, context?: any, history?: any) {
    const result = await this.processMessage(message);
    return {
      text: result.response,
      intent: result.intent,
      reasoning: result.reasoning || "Optimizing your shopping journey.",
      suggestedProducts: [] // This will be hydrated by the pipeline if intent is 'search'
    };
  }
};
