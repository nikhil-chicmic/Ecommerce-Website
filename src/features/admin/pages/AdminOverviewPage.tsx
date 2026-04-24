import React from 'react';
import { Package, Users, DollarSign, BrainCircuit, TrendingUp, Zap, BarChart3 } from 'lucide-react';
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Strategic Insights */}
        <div className="ai-glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <BarChart3 size={24} color="var(--brand-secondary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Neural Intent Clusters</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { cluster: 'Premium Performance Gear', weight: '42%', status: 'Trending High' },
              { cluster: 'Sustainable Tech Gifts', weight: '28%', status: 'Stable' },
              { cluster: 'Entry-level Skincare Logic', weight: '15%', status: 'Decelerating' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.cluster}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume Weight: {item.weight}</div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: item.status.includes('High') ? 'var(--status-success)' : 'var(--text-muted)' }}>{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Action Panel */}
        <div className="ai-glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-2xl)', background: 'var(--brand-secondary)', color: 'white' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>AI Strategist</h2>
          <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '24px', opacity: 0.9 }}>
            Gemini has detected a 15% drop-off in the "Checkout Reinforcement" layer for mobile users. Recommended action: Enable dynamic trust overlays for orders over $200.
          </p>
          <button style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'white', color: 'var(--brand-secondary)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            Auto-Apply Optimization
          </button>
        </div>

      </div>
    </div>
  );
};
