import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../../../config/env';

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash";

export const geminiService = {
  async processCoPilotQuery(message: string, context?: any, history?: any) {
    const rawQuery = message.toLowerCase().trim();
    
    try {
        // 1. DYNAMIC CATEGORY VERIFICATION
        // We fetch the live categories from the store to see what we actually sell
        const catRes = await fetch('https://dummyjson.com/products/categories');
        const categories = await catRes.json(); // Array of { slug, name, url }
        const categoryNames = categories.map((c: any) => c.slug.toLowerCase());

        // 2. DETECT SHOPPING INTENT (Dynamic)
        // Check if the message contains any of our live categories or shopping verbs
        const shoppingVerbs = ['buy', 'search', 'find', 'show', 'need', 'want', 'get', 'price', 'check', 'available'];
        const isShoppingVerb = shoppingVerbs.some(verb => rawQuery.includes(verb));
        const isCategoryMatch = categoryNames.some(cat => rawQuery.includes(cat) || rawQuery.includes(cat.slice(0, -1))); // handle basic plurals

        if (!isShoppingVerb && !isCategoryMatch && rawQuery.length > 5) {
            return {
                text: "I am your Lumina Concierge, specialized exclusively in our premium collection. I can help you find products, check availability, or explore our latest arrivals. What can I help you find today?",
                intent: 'reject',
                reasoning: "Domain lock: Non-ecommerce query.",
                suggestedProducts: []
            };
        }

        // 3. INTELLIGENT QUERY CLEANING
        // Strip out the "noise" to find the real product name
        let cleanQuery = rawQuery
            .replace(/show me|i want to buy|i need|find|search for|do you have|any|available|can i get|where is|the|a |an /g, '')
            .trim();

        // Automatic plural correction (strip 's' if query doesn't match and ends in 's')
        if (cleanQuery.endsWith('s') && cleanQuery.length > 3) {
            const singularTry = cleanQuery.slice(0, -1);
            // Quick check if the singular version exists in categories
            if (categoryNames.includes(singularTry)) {
                cleanQuery = singularTry;
            }
        }

        // 4. LIVE INVENTORY FULFILLMENT
        const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(cleanQuery)}&limit=4`);
        const data = await response.json();
        const products = data.products || [];

        if (products.length > 0) {
            return {
                text: `I've explored our premium collection and found these items matching your interest in "${cleanQuery}":`,
                intent: 'search',
                reasoning: "Dynamic inventory match found.",
                suggestedProducts: products
            };
        } else {
            return {
                text: `I've checked our current inventory, but we don't have any items matching "${cleanQuery}" at the moment. Would you like to explore our other premium categories?`,
                intent: 'search',
                reasoning: "No dynamic match found.",
                suggestedProducts: []
            };
        }
    } catch (error) {
        return {
            text: "I'm having a brief synchronization moment with our inventory system. Please try your search again.",
            intent: 'chat',
            reasoning: "API Sync Failure.",
            suggestedProducts: []
        };
    }
  },

  // Still used for PDP insights
  async getProductInsights(product: any, context?: any) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `2-sentence luxury marketing for: ${product.title}. Description: ${product.description}. JSON: {summary, pros:[], cons:[], fitReason}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      return JSON.parse(text.substring(startIdx, endIdx + 1));
    } catch (error) {
      return { summary: "An elite choice.", pros: ["Premium"], cons: [], fitReason: "Lumina quality." };
    }
  }
};
