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

import { useSearchParams } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Derive active filters directly from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentCategory = searchParams.get('category') || 'all';
  const currentSortBy = (searchParams.get('sortBy') as ProductFilters['sortBy']) || undefined;
  const currentSearch = searchParams.get('search') || '';
  
  const itemsPerPage = 10;
  
  // 2. Local state only for the search input (to keep it snappy)
  const [searchInput, setSearchInput] = useState(currentSearch);
  
  // Update local input if URL changes (e.g. back navigation)
  React.useEffect(() => {
    setSearchInput(currentSearch);
    window.scrollTo(0, 0);
  }, [currentSearch, currentCategory, currentSortBy, currentPage]);

  // 3. Debounce the search input for URL synchronization
  const debouncedSearch = useDebounce(searchInput, 500);

  React.useEffect(() => {
    if (debouncedSearch) dispatch(trackSearch(debouncedSearch));
    
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('search', debouncedSearch);
      if (debouncedSearch !== currentSearch) newParams.set('page', '1');
    } else {
      newParams.delete('search');
    }
    
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedSearch]);

  // 4. Memoized filters for the API hook
  const appliedFilters = React.useMemo(() => ({
    search: currentSearch,
    category: currentCategory,
    sortBy: currentSortBy,
  }), [currentSearch, currentCategory, currentSortBy]);

  const { data, isLoading, isError, error } = useProducts(
    (currentPage - 1) * itemsPerPage, 
    itemsPerPage, 
    appliedFilters
  );

  const handleFilterChange = (newFilters: ProductFilters) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (newFilters.category && newFilters.category !== 'all') {
      newParams.set('category', newFilters.category);
    } else {
      newParams.delete('category');
    }
    
    if (newFilters.sortBy) {
      newParams.set('sortBy', newFilters.sortBy);
    } else {
      newParams.delete('sortBy');
    }
    
    newParams.set('page', '1'); 
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 0;
  
  // Reconstruct filters object for components expecting it
  const filters = { search: searchInput, category: currentCategory, sortBy: currentSortBy };


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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none' }}
              />
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
              Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)
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

          {/* Pagination System */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  // Show only first, last, and pages around current
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} style={{ color: 'var(--text-muted)' }}>...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
