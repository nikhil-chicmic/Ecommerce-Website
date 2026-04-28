import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Package, Settings, CreditCard, LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { logout } from '../store/authSlice';
import { supabase } from '../../../lib/supabase';
import './Auth.css';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // profileData = the "Saved" state (Source of Truth for UI)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '',
    dob: ''
  });

  // formData = the "Draft" state (Only for input fields)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    dob: ''
  });

  // Fetch profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data && !error) {
        const initialData = {
          name: data.full_name || user.name || '',
          phone: data.phone_number || '',
          dob: data.date_of_birth || ''
        };
        setProfileData(initialData);
        setFormData(initialData);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleStartEdit = () => {
    // Reset formData to the current saved profileData before starting edit
    setFormData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.name,
          phone_number: formData.phone || null,
          date_of_birth: formData.dob || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update the "Source of Truth" ONLY on success
      setProfileData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-user-info">
            <div className="profile-avatar">
              {profileData.name.charAt(0) || 'U'}
            </div>
            <div className="profile-name-section">
              <h2 className="profile-name">{profileData.name}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <button 
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} /> Personal Info
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={20} /> My Orders
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} /> Settings
            </button>
            <button className="profile-nav-item logout" onClick={handleLogout}>
              <LogOut size={20} /> Sign Out
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600 }}
                    onClick={handleStartEdit}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      className="btn-text" 
                      style={{ fontSize: '0.875rem' }}
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 20px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)' }}
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="profile-card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="profile-input"
                        placeholder="Your full name"
                      />
                    ) : (
                      <div style={{ padding: '8px 0' }}>{profileData.name}</div>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Email Address</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="profile-input disabled"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                        {user?.email} <ShieldCheck size={16} color="#10b981" />
                      </div>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="profile-input"
                      />
                    ) : (
                      <div style={{ padding: '8px 0', color: profileData.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profileData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="info-item">
                    <label>Date of Birth</label>
                    {isEditing ? (
                      <input 
                        type="date" 
                        value={formData.dob} 
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className="profile-input"
                      />
                    ) : (
                      <div style={{ padding: '8px 0', color: profileData.dob ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profileData.dob || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Order History</h3>
              </div>
              <div className="profile-card-body">
                <OrdersList userId={user?.id} />
              </div>
            </div>
          )}


          {activeTab === 'settings' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Account Settings</h3>
              </div>
              <div className="profile-card-body">
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-4)' }}>Manage your notification preferences and security settings here.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-4) 0', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Email Notifications</h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Receive order updates and promotions</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const OrdersList: React.FC<{ userId?: string }> = ({ userId }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>;

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
        <Package size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto var(--spacing-4)' }} />
        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>No orders yet</h4>
        <p style={{ color: 'var(--text-muted)' }}>When you buy something, it will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {orders.map(order => (
        <div key={order.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Placed</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>${order.total_amount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  background: order.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: order.status === 'PAID' ? '#10b981' : '#3b82f6'
                }}>
                  {order.status}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ORDER # {order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.order_items?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => navigate(`/product/${item.product_id}`)}
                />
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${item.product_id}`)}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600 }}>${item.price}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
