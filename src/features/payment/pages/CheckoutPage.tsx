import { AlertTriangle, ArrowLeft, CheckCircle, CreditCard, MapPin, Phone, Plus, ShieldCheck, User as UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { fetchAddresses, saveAddress, setSelectedAddress } from '../../auth/store/addressSlice';
import toast from 'react-hot-toast';
import { useCart } from '../../cart/hooks/useCart';
import { RazorpaySimulationModal } from '../components/RazorpaySimulationModal';
import { usePayment } from '../hooks/usePayment';
import '../styles/payment.css';

export const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const { addresses, selectedAddressId } = useSelector((state: RootState) => state.address);
  const { currentOrder, isProcessing, error, showMockModal, initiateCheckout, handlePaymentSuccess, handlePaymentFailure } = usePayment();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA'
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (user?.id) {
      dispatch(fetchAddresses(user.id) as any);
    }
  }, [isAuthenticated, navigate, user, dispatch]);

  const validateForm = () => {
    if (!addressForm.full_name) return 'Full name is required';
    if (!addressForm.phone_number || addressForm.phone_number.length < 10) return 'Valid phone number is required';
    if (!addressForm.street_address) return 'Street address is required';
    if (!addressForm.city) return 'City is required';
    if (!addressForm.postal_code || addressForm.postal_code.length < 5) return 'Valid postal code is required';
    return null;
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      setFormError(error);
      return;
    }
    
    setFormError(null);
    const loadingToast = toast.loading('Securing address details...');
    
    try {
      if (!user?.id) throw new Error('Authentication required to save address');
      
      const resultAction = await dispatch(saveAddress({ ...addressForm, userId: user.id }) as any);
      
      if (saveAddress.fulfilled.match(resultAction)) {
        toast.success('Address saved successfully!', { id: loadingToast });
        setIsAddingAddress(false);
        setAddressForm({ full_name: '', phone_number: '', street_address: '', city: '', state: '', postal_code: '', country: 'USA' });
      } else {
        throw new Error(resultAction.error?.message || 'Database rejected the address');
      }
    } catch (err: any) {
      console.error('Address Save Error:', err);
      toast.error(err.message || 'Network error occurred', { id: loadingToast });
    }
  };

  const handleSelectAddress = (id: string) => {
    if (selectedAddressId === id) {
      toast('This address is already selected', { icon: '📍' });
      return;
    }
    dispatch(setSelectedAddress(id));
    toast.success('Shipping destination updated');
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  // If order is paid, show elite success screen
  if (currentOrder?.status === 'PAID') {
    return (
      <div className="checkout-container" style={{ maxWidth: '800px', margin: '60px auto' }}>
        <div className="payment-success-screen ai-glass-panel" style={{ padding: '60px', textAlign: 'center', border: '1px solid var(--status-success)', borderRadius: '32px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} color="var(--status-success)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '12px' }}>Order Success</h2>
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
        <div className="checkout-section-main" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="checkout-card" style={{ background: 'var(--bg-elevated)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={22} color="var(--brand-primary)" /> Shipping Destination
              </h2>
              {!isAddingAddress && (
                <button className="btn-text" onClick={() => setIsAddingAddress(true)} style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Plus size={16} /> New Address
                </button>
              )}
            </div>

            {isAddingAddress ? (
              <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Recipient Name</label>
                    <input type="text" placeholder="John Doe" value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} className="profile-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 000-0000" value={addressForm.phone_number} onChange={e => setAddressForm({...addressForm, phone_number: e.target.value})} className="profile-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" placeholder="123 Silicon Valley Way" value={addressForm.street_address} onChange={e => setAddressForm({...addressForm, street_address: e.target.value})} className="profile-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" placeholder="Palo Alto" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="profile-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" placeholder="CA" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="profile-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input type="text" placeholder="94301" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} className="profile-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                </div>
                {formError && <p style={{ color: 'var(--status-error)', fontSize: '0.875rem' }}>{formError}</p>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}>Save Address</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsAddingAddress(false)} style={{ padding: '12px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {addresses.map(addr => (
                  <div 
                    key={addr.id} 
                    onClick={() => handleSelectAddress(addr.id)}
                    style={{ 
                      padding: '20px', 
                      borderRadius: '16px', 
                      border: `2px solid ${selectedAddressId === addr.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                      background: selectedAddressId === addr.id ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserIcon size={14} color="var(--text-muted)" /> {addr.full_name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{addr.street_address}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{addr.city}, {addr.state} {addr.postal_code}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Phone size={12} /> {addr.phone_number}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="checkout-card" style={{ background: 'var(--bg-elevated)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={22} color="var(--brand-primary)" /> Itemized Summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={item.thumbnail} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', background: 'var(--bg-secondary)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Secure Shipping</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800 }}>
                <span>Total</span>
                <span>${items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '20px', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', justifyContent: 'center' }}
              onClick={() => {
                if (!selectedAddressId) {
                  toast.error('Please select a shipping address first');
                  return;
                }
                if (selectedAddress) initiateCheckout(selectedAddress);
              }}
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
