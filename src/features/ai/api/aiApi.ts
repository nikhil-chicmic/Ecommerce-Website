import { productApi } from '../../products/api/productApi';
import type { Product } from '../../products/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AIResponse {
  text: string;
  suggestedProducts?: Product[];
}

export const aiApi = {
  async processIntent(query: string): Promise<AIResponse> {
    await delay(1200); // Simulate AI thinking

    const q = query.toLowerCase();

    // Intent Categories Mapping
    const mappings = [
      { keywords: ['cheap', 'budget', 'affordable', 'under', 'low price'], intent: 'budget', msg: "I've scanned our inventory and found some excellent budget-friendly options that don't compromise on quality." },
      { keywords: ['phone', 'smartphone', 'mobile', 'iphone'], intent: 'smartphones', msg: "Looking for an upgrade? Here are our top-rated smartphones featuring cutting-edge AI chips." },
      { keywords: ['laptop', 'computer', 'pc', 'macbook'], intent: 'laptops', msg: "Whether you need it for heavy rendering, gaming, or everyday work, these laptops are powerhouse machines." },
      { keywords: ['gift', 'present', 'anniversary', 'birthday'], intent: 'fragrances', msg: "A luxury fragrance makes a perfect gift. I've selected some of our best-selling signature scents for you." },
      { keywords: ['skincare', 'beauty', 'cream', 'serum'], intent: 'skincare', msg: "Self-care is important. Here are some premium skincare products highly rated by our community." },
      { keywords: ['home', 'decoration', 'furniture'], intent: 'home-decoration', msg: "Elevate your living space with these beautiful, modern home decor pieces." },
      { keywords: ['hello', 'hi', 'hey', 'help'], intent: 'greeting', msg: "Hello! I'm the AIStore Neural Assistant. You can ask me to find specific products, brands, or even gift recommendations based on your budget!" }
    ];

    let intentCategory = '';
    let responseText = '';

    for (const mapping of mappings) {
      if (mapping.keywords.some(kw => q.includes(kw))) {
        intentCategory = mapping.intent;
        responseText = mapping.msg;
        break;
      }
    }

    if (intentCategory === 'greeting') {
      return { text: responseText };
    }

    if (!intentCategory) {
      // Advanced Semantic Search Simulation Fallback
      const { products } = await productApi.getProducts(0, 3, { search: query });
      return {
        text: products.length > 0 
          ? `I couldn't find an exact category, but my neural net matched these ${products.length} specific items to your query.` 
          : "I couldn't find exactly what you're looking for in our current database. Could you try describing it with different keywords?",
        suggestedProducts: products,
      };
    }

    // Fetch intent-based categories
    if (intentCategory === 'budget') {
      const { products } = await productApi.getProducts(0, 100, {});
      const cheapProducts = products.filter(p => p.price < 50).slice(0, 3);
      return { text: responseText, suggestedProducts: cheapProducts };
    }

    const { products } = await productApi.getProducts(0, 4, { category: intentCategory });
    return { text: responseText, suggestedProducts: products };
  }
};
