import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Settings } from 'lucide-react';
import '../styles/admin.css';

export const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-4)', paddingLeft: 'var(--spacing-3)' }}>Admin Portal</h2>
        
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        
        <NavLink 
          to="/admin/products" 
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={20} /> Products
        </NavLink>

        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} /> Settings
        </NavLink>
      </aside>
      
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};
