import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, ShieldCheck, Truck, Star, Sparkles, BrainCircuit, Undo, ArrowLeft } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../../cart/hooks/useCart';
import { trackProductView } from '../../ai/store/aiSlice';
import { geminiService } from '../../ai/services/geminiService';
import type { RootState } from '../../../store';
import '../styles/products.css';

const SuggestedProducts: React.FC<{ category: string, currentProductId: string | number, limit?: number }> = ({ category, currentProductId, limit = 4 }) => {
  const { data } = useProducts(0, 10, { category });
  
  if (!data?.products) return null;
  
  // Filter out the current product and take limit
  const suggestions = data.products
    .filter(p => p.id !== currentProductId)
    .slice(0, limit);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(2, 1fr)', 
      gap: '20px' 
    }}>
      {suggestions.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { context } = useSelector((state: RootState) => state.ai);
  const { data: product, isLoading } = useProduct(id || '');
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(item => String(item.id) === String(id));
  const [aiInsights, setAiInsights] = useState<any>(null);

  useEffect(() => {
    if (id) dispatch(trackProductView(id));
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      geminiService.getProductInsights(product, {
        viewedProductIds: context.viewedProductIds,
        cartItems: [],
        lastSearch: ''
      }).then(setAiInsights);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) addToCart(product);
  };

  if (isLoading) return <div className="loading">Initializing Intelligence...</div>;
  if (!product) return <div className="error-container">Product not found</div>;

  return (
    <div style={{ maxWidth: '1280px', margin: '8px auto 40px auto', padding: '0 24px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> BACK TO DISCOVERY
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '64px', alignItems: 'start' }}>
        
        {/* Left Column: Image Gallery & Suggestions */}
        <div>
          <div className="pdp-gallery ai-glass-panel" style={{ 
            borderRadius: 'var(--radius-2xl)', 
            overflow: 'hidden', 
            padding: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={product.thumbnail} 
              alt={product.title} 
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-xl)', display: 'block' }} 
            />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--status-error)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                -{Math.round(product.discountPercentage)}%
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Grid (Under Image) */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Similar Products</h3>
            <button 
              onClick={() => navigate('/')}
              style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              VIEW ALL
            </button>
          </div>
          <SuggestedProducts category={product.category} currentProductId={product.id} limit={4} />
        </div>
      </div>

        {/* Right Column: Info & AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
              <BrainCircuit size={16} /> AI Verified
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', lineHeight: 1.1 }}>{product.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>${product.price}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                <Star size={20} fill="#fbbf24" /> {product.rating}
              </div>
            </div>
          </div>

          {/* AI Decision Layer */}
          <div className="ai-glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--brand-secondary)', background: 'rgba(139, 92, 246, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={18} color="var(--brand-secondary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Neural Insights</h3>
            </div>
            
            {!aiInsights ? (
              <div className="shimmer" style={{ height: '100px', borderRadius: '8px' }}></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{aiInsights.summary}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--status-success)', marginBottom: '8px', letterSpacing: '0.05em' }}>Neural Pros</h4>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                      {aiInsights.pros.map((p: string, i: number) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--status-error)', marginBottom: '8px', letterSpacing: '0.05em' }}>Neural Cons</h4>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                      {aiInsights.cons.map((p: string, i: number) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--brand-secondary)' }}>Why this fits you:</strong> {aiInsights.fitReason}
                </div>
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>{product.description}</p>

          <div style={{ display: 'flex', gap: '16px' }}>
            {!cartItem ? (
              <button 
                className="btn-primary" 
                onClick={handleAddToCart}
                style={{ flex: 1, padding: '20px', fontSize: '1.125rem', borderRadius: 'var(--radius-xl)' }}
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={22} /> {product.stock > 0 ? 'Add to Collection' : 'Out of Stock'}
              </button>
            ) : (
              <div className="ai-glass-panel" style={{ 
                flex: 1,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 24px', 
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-elevated)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--brand-primary)'
              }}>
                <button 
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  style={{ background: 'var(--brand-primary)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  -
                </button>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Item Count</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.5rem' }}>{cartItem.quantity}</span>
                </div>
                <button 
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  style={{ background: 'var(--brand-primary)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div className="pdp-trust-badges" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px',
            marginTop: '32px',
            padding: '20px',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(12px)'
          }}>
            <div className="trust-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <ShieldCheck size={24} color="var(--text-secondary)" strokeWidth={1.5} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Secured</span>
            </div>
            <div className="trust-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <Truck size={24} color="var(--text-secondary)" strokeWidth={1.5} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Express</span>
            </div>
            <div className="trust-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <Undo size={24} color="var(--text-secondary)" strokeWidth={1.5} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>30d Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


