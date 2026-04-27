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
   * Primary interface for the Persistent Assistant
   */
  async processCoPilotQuery(
    query: string, 
    context: UserContext, 
    history: any[]
  ): Promise<AISystemResponse> {
    // Artificial latency for premium "thinking" feel
    await new Promise(r => setTimeout(r, 1200)); 

    const lowerQuery = query.toLowerCase();
    
    // 1. Strict Domain Enforcement
    const commerceKeywords = ['product', 'price', 'buy', 'shoe', 'tech', 'glass', 'watch', 'find', 'search', 'cost', 'deal', 'quality', 'style', 'collection', 'gym', 'sport', 'fashion'];
    const isCommerceRelated = commerceKeywords.some(keyword => lowerQuery.includes(keyword)) || 
                             lowerQuery.split(' ').length < 3; // Allow short greetings

    if (!isCommerceRelated) {
      return {
        intent: 'greeting',
        text: "I specialize in helping you navigate our high-end collections. Could we focus on finding the perfect product for your current needs?",
        reasoning: "Query flagged as out-of-domain. Re-centering on commerce value proposition."
      };
    }

    // 2. Intelligent Intent Detection
    let intent: AISystemResponse['intent'] = 'discovery';
    if (lowerQuery.includes('compare') || lowerQuery.includes('better than') || lowerQuery.includes('vs')) intent = 'comparison';
    if (lowerQuery.includes('why') || lowerQuery.includes('worth') || lowerQuery.includes('quality')) intent = 'decision_support';
    if (lowerQuery.includes('checkout') || lowerQuery.includes('pay') || lowerQuery.includes('order')) intent = 'checkout_help';

    // 3. Dynamic Product Fetching with Mid-Range Logic
    const { products } = await productApi.getProducts(0, 100, {});
    
    // Mid-range filter: Items between $20 and $500 (premium but accessible)
    const midRangeProducts = products.filter(p => p.price >= 20 && p.price <= 500);
    
    // Contextual matching
    let matched = midRangeProducts;
    if (lowerQuery.includes('gym') || lowerQuery.includes('sport')) {
      matched = midRangeProducts.filter(p => p.category.includes('men') || p.category.includes('sport') || p.category.includes('watch'));
    } else if (lowerQuery.includes('tech') || lowerQuery.includes('gadget')) {
      matched = midRangeProducts.filter(p => p.category.includes('laptop') || p.category.includes('phone') || p.category.includes('watch'));
    } else if (lowerQuery.includes('style') || lowerQuery.includes('look')) {
      matched = midRangeProducts.filter(p => p.category.includes('glass') || p.category.includes('jewel') || p.category.includes('dress'));
    }

    // Fallback to general mid-range if no specific match
    const results = matched.length >= 2 ? matched.slice(0, 2) : midRangeProducts.slice(0, 2);

    // 4. Dynamic Response Composition
    const templates = {
      discovery: [
        `I've identified these mid-range selections that balance exceptional craftsmanship with accessibility. They align perfectly with your interest in ${lowerQuery.includes('gym') ? 'performance gear' : 'quality essentials'}.`,
        `Based on our current catalog, these two pieces represent the "sweet spot" of our collection—offering pro-level specs at a refined price point.`,
        `Analyzing our inventory for ${lowerQuery}... I recommend these balanced options that maintain our high standard of engineering.`
      ],
      decision_support: [
        `Quality is our primary directive. These items are selected because they maintain high durability ratings while staying within a versatile mid-range budget.`,
        `When evaluating value, I focus on long-term utility. These suggestions are frequently cited for exceeding user expectations in daily use.`
      ],
      comparison: [
        `Comparing options for you. While we have entry-level and ultra-premium tiers, these mid-range selections offer the most comprehensive feature sets for the investment.`
      ]
    };

    const pool = templates[intent as keyof typeof templates] || templates.discovery;
    const responseText = pool[Math.floor(Math.random() * pool.length)];

    return {
      intent,
      text: responseText,
      suggestedProducts: results,
      reasoning: `Synthesized from ${products.length} catalog items. Applied mid-range pricing filter ($20-$500) to ensure accessibility without compromising brand prestige.`,
      actionItems: ["View Specifications", "Compare Features"]
    };
  },

  /**
   * PDP Decision Support
   */
  async getProductInsights(product: Product, context: UserContext): Promise<{
    summary: string;
    pros: string[];
    cons: string[];
    fitReason: string;
  }> {
    await new Promise(r => setTimeout(r, 600));

    return {
      summary: `${product.title} represents a pinnacle of ${product.category} engineering. It's specifically tailored for users who demand professional results.`,
      pros: ["Precision manufacturing", "High-efficiency materials", "Optimized user ergonomics"],
      cons: ["Professional-grade learning curve", "High demand availability"],
      fitReason: `This selection matches your preference for ${product.category}. It's currently one of the most reliable choices in the mid-to-high performance tier.`
    };
  }
};
