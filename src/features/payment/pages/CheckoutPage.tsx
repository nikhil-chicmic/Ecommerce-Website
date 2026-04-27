import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react';
import type { RootState } from '../../../store';
import { usePayment } from '../hooks/usePayment';
import { useCart } from '../../cart/hooks/useCart';
import { RazorpaySimulationModal } from '../components/RazorpaySimulationModal';
import '../styles/payment.css';

export const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useCart();
  const { currentOrder, isProcessing, error, showMockModal, initiateCheckout, handlePaymentSuccess, handlePaymentFailure } = usePayment();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Security: Redirect if session lost
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // If order is paid, show elite success screen
  if (currentOrder?.status === 'PAID') {
    return (
      <div className="checkout-container" style={{ maxWidth: '800px', margin: '60px auto' }}>
        <div className="payment-success-screen ai-glass-panel" style={{ padding: '60px', textAlign: 'center', border: '1px solid var(--status-success)', borderRadius: '32px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} color="var(--status-success)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '12px' }}>Order Secured</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 40px' }}>
            Success! Your order <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>#{currentOrder.id.slice(-8).toUpperCase()}</span> is now being processed by our secure fulfillment network.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                dispatch({ type: 'order/clearOrder' });
                navigate('/');
              }} 
              className="btn-primary"
              style={{ padding: '16px 32px', borderRadius: '12px', fontWeight: 700 }}
            >
              Continue Discovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart empty and no pending order
  if (items.length === 0 && !currentOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="checkout-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '32px', fontWeight: 600 }}
      >
        <ArrowLeft size={18} /> Back to Selection
      </button>

      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '8px' }}>Finalize Order</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Review your selected items before secure fulfillment.</p>
      </div>

      {error && (
        <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '16px', borderRadius: '12px' }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px', alignItems: 'start' }}>
        <div className="checkout-section-main">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={22} color="var(--brand-primary)" /> Order Summary
          </h2>
          <div className="ai-glass-panel" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            {items.map(item => (
              <div key={item.id} className="checkout-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <img src={item.thumbnail} alt={item.title} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', background: 'var(--bg-secondary)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-sidebar-sticky">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard size={22} color="var(--brand-primary)" /> Secure Payment
          </h2>
          <div className="ai-glass-panel" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Secure Shipping</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>COMPLIMENTARY</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '8px' }}>
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: '2px solid var(--brand-primary)', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)', cursor: 'pointer' }}>
                <input type="radio" name="payment_method" defaultChecked />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Instant Pay (Razorpay)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cards, UPI, NetBanking</div>
                </div>
              </label>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '20px', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', justifyContent: 'center' }}
              onClick={initiateCheckout}
              disabled={isProcessing || showMockModal}
            >
              {isProcessing ? 'Processing...' : 'Authorize Payment'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              🔒 256-BIT ENCRYPTED CHANNEL
            </p>
          </div>
        </div>
      </div>

      {showMockModal && currentOrder && (
        <RazorpaySimulationModal 
          order={currentOrder}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};
