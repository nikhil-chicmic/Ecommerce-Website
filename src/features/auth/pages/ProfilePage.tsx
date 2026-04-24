import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Package, Settings, CreditCard, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { logout } from '../store/authSlice';
import './Auth.css';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
        
        {/* Sidebar */}
        <div style={{ flex: '1 1 250px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', border: '1px solid var(--border-color)', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto var(--spacing-4)' }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-1)' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <button 
              className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Personal Info
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> Order History
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <CreditCard size={18} /> Payment Methods
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Account Settings
            </button>
            <div style={{ height: '1px', background: 'var(--border-color)', margin: 'var(--spacing-2) 0' }} />
            <button 
              className="profile-tab-btn text-error"
              onClick={handleLogout}
              style={{ color: 'var(--status-error)' }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Personal Information</h3>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Edit</button>
              </div>
              <div className="profile-card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    <div>{user?.name}</div>
                  </div>
                  <div className="info-item">
                    <label>Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user?.email} <ShieldCheck size={16} color="var(--status-success)" />
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Phone Number</label>
                    <div style={{ color: 'var(--text-muted)' }}>Not provided</div>
                  </div>
                  <div className="info-item">
                    <label>Date of Birth</label>
                    <div style={{ color: 'var(--text-muted)' }}>Not provided</div>
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
              <div className="profile-card-body" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                <Package size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto var(--spacing-4)' }} />
                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>No orders yet</h4>
                <p style={{ color: 'var(--text-muted)' }}>When you buy something, it will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Payment Methods</h3>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Add New</button>
              </div>
              <div className="profile-card-body" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                <CreditCard size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto var(--spacing-4)' }} />
                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>No saved payment methods</h4>
                <p style={{ color: 'var(--text-muted)' }}>Securely save your card for faster checkout.</p>
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
