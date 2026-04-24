import React from 'react';
import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useProducts } from '../../products/hooks/useProducts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

export const AdminDashboardPage: React.FC = () => {
  const { data } = useProducts(0, 100, {}); // fetch without search/filter for stats
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-1)' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <h4>Total Products</h4>
            <div className="value">{data?.total || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-info">
            <h4>Total Revenue</h4>
            <div className="value">$0.00</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h4>Active Users</h4>
            <div className="value">1</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h4>Sales Growth</h4>
            <div className="value">0%</div>
          </div>
        </div>
      </div>
      
      <div className="admin-table-container" style={{ padding: 'var(--spacing-6)' }}>
        <h3>Recent Activity Placeholder</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>No recent activity to show.</p>
      </div>
    </div>
  );
};
