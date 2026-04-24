import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="product-card skeleton">
      <div className="product-image-container skeleton-img"></div>
      <div className="product-info">
        <div className="skeleton-text category"></div>
        <div className="skeleton-text title"></div>
        <div className="skeleton-text title short"></div>
        <div className="product-price-row">
          <div className="skeleton-text price"></div>
        </div>
      </div>
    </div>
  );
};
