import React from 'react';
import { useCategories } from '../hooks/useProducts';
import type { ProductFilters } from '../types';

interface Props {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

export const ProductFiltersSidebar: React.FC<Props> = ({ filters, onFilterChange }) => {
  const { data: categories = [], isLoading } = useCategories();

  const handleCategory = (category: string) => {
    onFilterChange({ ...filters, category });
  };
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as any });
  };

  return (
    <aside className="filters-sidebar">
      <div className="filter-section">
        <h3>Sort By</h3>
        <select 
          className="filter-select"
          value={filters.sortBy || ''}
          onChange={handleSort}
        >
          <option value="">Recommended</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
        </select>
      </div>

      <div className="filter-section">
        <h3>Categories</h3>
        {isLoading ? (
          <div className="category-skeleton-list">
            <div className="skeleton-text" style={{ width: '100%' }}></div>
            <div className="skeleton-text" style={{ width: '80%' }}></div>
            <div className="skeleton-text" style={{ width: '90%' }}></div>
            <div className="skeleton-text" style={{ width: '70%' }}></div>
          </div>
        ) : (
          <ul className="category-list">
            <li>
              <button 
                className={`category-btn ${!filters.category || filters.category === 'all' ? 'active' : ''}`}
                onClick={() => handleCategory('all')}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button 
                  className={`category-btn ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => handleCategory(cat)}
                >
                  {cat.replace('-', ' ')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
