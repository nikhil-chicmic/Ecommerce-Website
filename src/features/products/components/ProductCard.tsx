import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../../cart/hooks/useCart';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(item => String(item.id) === String(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    addToCart(product);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, newQty: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, newQty);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image-container">
          <img 
            src={product.thumbnail} 
            alt={product.title} 
            className="product-image"
            loading="lazy" 
          />
          {product.discountPercentage && product.discountPercentage > 0 && (
            <div className="product-badge discount">
              -{Math.round(product.discountPercentage)}%
            </div>
          )}
          {product.isCustom && (
            <div className="product-badge custom">EXCLUSIVE</div>
          )}
        </div>
        
        <div className="product-info">
          <div className="product-category">{product.category}</div>
          <h3 className="product-title" title={product.title}>{product.title}</h3>
          <div className="product-price-row">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {product.rating && (
              <span className="product-rating">★ {product.rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-action-area">
        {!cartItem ? (
          <button className="btn-add-to-cart" onClick={handleAddToCart}>
            <ShoppingCart size={18} /> Add to Cart
          </button>
         ) : (
          <div className="product-quantity-selector">
            <button 
              className="btn-qty-action"
              onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
            >
              -
            </button>
            <span className="qty-display">
              {cartItem.quantity} {cartItem.quantity === 1 ? 'ITEM' : 'ITEMS'}
            </span>
            <button 
              className="btn-qty-action"
              onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
