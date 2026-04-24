import { productApi } from '../../products/api/productApi';
import type { Product } from '../../products/types';

/**
 * AI CORE EXECUTION LAYER
 * Powering the AI-Native Commerce System
 */

export interface AISystemResponse {
  text: string;
  intent: 'discovery' | 'comparison' | 'decision_support' | 'checkout_help' | 'greeting';
  suggestedProducts?: Product[];
  reasoning?: string; // AI's internal reasoning for the recommendation
  actionItems?: string[]; // Dynamic CTAs for the user
}

export interface UserContext {
  viewedProductIds: string[];
  cartItems: string[];
  lastSearch: string;
}

const SYSTEM_PROMPT = `
You are the AIStore Co-pilot, a high-end personal shopping strategist. 
Your goal is to reduce user friction and provide elite decision support.
You have access to the full product catalog and user behavior history.

RULES:
1. Provide emotional + logical buying support.
2. If the user is vague (e.g. "something premium"), ask clarifying questions about use-case or style.
3. Always provide a "Why this fits you" reasoning for suggestions.
4. Detect hesitation (e.g. comparing many items) and offer a comparison chart.
5. Use a sophisticated, intelligent, but instant tone.
`;

export const geminiService = {
  /**
   * Primary interface for the Persistent Copilot
   */
  async processCoPilotQuery(
    query: string, 
    context: UserContext, 
    history: any[]
  ): Promise<AISystemResponse> {
    // Simulate Gemini 2.5 Flash Lite Fast Response
    await new Promise(r => setTimeout(r, 800)); 

    const lowerQuery = query.toLowerCase();
    
    // Reasoning Step: Determine Intent
    let intent: AISystemResponse['intent'] = 'discovery';
    if (lowerQuery.includes('compare') || lowerQuery.includes('better than')) intent = 'comparison';
    if (lowerQuery.includes('why should i') || lowerQuery.includes('is it worth')) intent = 'decision_support';
    if (lowerQuery.includes('buy') || lowerQuery.includes('checkout')) intent = 'checkout_help';

    // Logic: Intelligent Product Discovery
    if (intent === 'discovery') {
      const { products } = await productApi.getProducts(0, 100, {});
      
      // AI-Native Filtering (Simulating NL Understanding)
      let filtered = products;
      if (lowerQuery.includes('gym') || lowerQuery.includes('sport')) {
        filtered = products.filter(p => p.category === 'mens-shoes' || p.category === 'mens-watches');
      }
      
      if (lowerQuery.includes('premium')) {
        filtered = [...filtered].sort((a, b) => b.price - a.price);
      }

      const results = filtered.slice(0, 3);

      return {
        intent,
        text: results.length > 0 
          ? `I've curated a selection of premium equipment optimized for high-performance ${lowerQuery.includes('gym') ? 'training' : 'environments'}. These pieces are selected for their durability and technological edge.`
          : "I understand you're looking for something specialized. Could you tell me more about your specific style preferences or performance requirements?",
        suggestedProducts: results,
        reasoning: "Selected based on high user ratings in performance categories and current session context.",
        actionItems: results.length > 0 ? ["View Comparison", "Ask about materials"] : ["See all categories"]
      };
    }

    // Default Support logic
    return {
      intent: 'greeting',
      text: "I'm monitoring your session and I'm ready to assist with any technical specs or comparison needs. What's on your mind?",
      reasoning: "General greeting based on session initiation."
    };
  },

  /**
   * PDP Decision Support (Why this product fits you)
   */
  async getProductInsights(product: Product, context: UserContext): Promise<{
    summary: string;
    pros: string[];
    cons: string[];
    fitReason: string;
  }> {
    // Simulate Gemini Reasoning
    await new Promise(r => setTimeout(r, 600));

    return {
      summary: `${product.title} is a ${product.category} powerhouse designed for users who prioritize ${product.rating > 4.5 ? 'quality and long-term value' : 'functional efficiency'}.`,
      pros: ["Exceptional build quality", "Top-tier community rating", "Competitive price-to-performance ratio"],
      cons: ["High demand may affect shipping", "Limited color variants"],
      fitReason: context.viewedProductIds.length > 2 
        ? `Since you've been exploring ${product.category}, this is the most balanced option in our catalog for your patterns.`
        : "This aligns with trending premium selections in your current search region."
    };
  }
};
