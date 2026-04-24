import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductFiltersSidebar } from '../components/ProductFiltersSidebar';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { useDebounce } from '../../../hooks/useDebounce';
import type { ProductFilters } from '../types';
import '../styles/products.css';

import { Sparkles, BrainCircuit } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { trackSearch } from '../../ai/store/aiSlice';

export const ProductsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: 'all',
    sortBy: undefined,
  });
  
  // Debounce the search input to avoid spamming the API
  const debouncedSearch = useDebounce(filters.search, 500);

  React.useEffect(() => {
    if (debouncedSearch) dispatch(trackSearch(debouncedSearch));
  }, [debouncedSearch]);

  // We memoize the applied filters so React Query can cache appropriately
  const appliedFilters = React.useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters.category, filters.sortBy, debouncedSearch]);

  const { data, isLoading, isError, error } = useProducts(0, 20, appliedFilters);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
      <div className="products-layout" style={{ marginTop: '0px' }}>
        <ProductFiltersSidebar filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="products-content">
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* AI Intent Discovery Bar - Premium Indigo Implementation */}
            <div className="ai-glass-panel" style={{ 
              padding: '24px 32px', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              maxWidth: '850px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center' }}>
                <Sparkles size={24} />
              </div>
              <input 
                type="text" 
                placeholder="Describe your ideal product..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none' }}
              />
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--brand-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '10px', letterSpacing: '0.1em' }}>
                 NEURAL ENGINE
              </div>
            </div>

            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '8px' }}>
                {filters.category === 'all' || !filters.category ? 'Discovery' : filters.category.replace('-', ' ')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>{data?.total || 0} ITEMS</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Intelligent curation active</span>
              </div>
            </div>
          </div>

          {isError && (
            <div className="auth-error" style={{ marginBottom: 'var(--spacing-6)' }}>
              Error loading products: {(error as Error).message}
            </div>
          )}

          <div className="products-grid">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : data?.products.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-12)', color: 'var(--text-muted)' }}>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              data?.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
