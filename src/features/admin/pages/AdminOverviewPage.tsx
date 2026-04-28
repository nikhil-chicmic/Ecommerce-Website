import { BrainCircuit, DollarSign, TrendingUp, Users, Zap } from 'lucide-react';
import React from 'react';
import { useProducts } from '../../products/hooks/useProducts';

export const AdminOverviewPage: React.FC = () => {
  const { data } = useProducts(0, 100, {});

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>Intelligence Command</h1>
          <p style={{ color: 'var(--text-muted)' }}>AI-Native Commerce Operations & Predictive Insights</p>
        </div>
        <button className="btn-primary" style={{ gap: '8px', background: 'var(--brand-secondary)' }}>
          <Zap size={18} /> Run Sync Analysis
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        {[
          { label: 'Revenue Momentum', val: '$142.5k', icon: <DollarSign />, trend: '+12%', color: 'var(--status-success)' },
          { label: 'Intelligence Depth', val: '98.2%', icon: <BrainCircuit />, trend: '+0.4%', color: 'var(--brand-secondary)' },
          { label: 'Predictive Conversion', val: '4.8%', icon: <TrendingUp />, trend: '+1.2%', color: 'var(--brand-primary)' },
          { label: 'Active Intent Loops', val: '1,240', icon: <Users />, trend: '+85', color: 'var(--text-primary)' }
        ].map((kpi, i) => (
          <div key={i} className="ai-glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{kpi.label}</span>
              <div style={{ color: kpi.color }}>{kpi.icon}</div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{kpi.val}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--status-success)', marginTop: '8px', fontWeight: 600 }}>{kpi.trend} vs last 24h</div>
          </div>
        ))}
      </div>
    </div>
  );
};
