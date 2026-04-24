import React, { useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../../auth/hooks/useAuth';
import '../styles/cart.css';

export const CartDrawer: React.FC = () => {
  const { items, totalAmount, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Close cart on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

  // Lock body scroll and prevent layout shift
  useEffect(() => {
    if (isCartOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout'); // We will build this in the Payment Phase
    }
  };

  return (
    <>
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={closeCart}
      />
      
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-hidden={!isCartOpen}>
        <div className="cart-header">
          <h2><ShoppingCart size={20} /> Your Cart</h2>
          <button className="btn-close" onClick={closeCart} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={64} style={{ opacity: 0.2 }} />
              <p>Your cart is empty.</p>
              <button className="btn-primary" onClick={closeCart}>Continue Shopping</button>
            </div>
          ) : (
            items.map(item => {
              const price = item.discountPercentage 
                ? item.price * (1 - item.discountPercentage / 100)
                : item.price;
                
              return (
                <div key={item.id} className="cart-item">
                  <img src={item.thumbnail} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title" title={item.title}>{item.title}</h4>
                    <span className="cart-item-price">${price.toFixed(2)}</span>
                    
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button 
                          className="btn-qty" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button 
                          className="btn-qty" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        className="btn-remove"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-summary-row">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <button 
            className="btn-checkout" 
            disabled={items.length === 0}
            onClick={handleCheckout}
          >
            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>
        </div>
      </div>
    </>
  );
};
