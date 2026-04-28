import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, ShoppingCart, User as UserIcon, BrainCircuit } from 'lucide-react';
import type { RootState } from '../../store';
import { logout } from '../../features/auth/store/authSlice';
import { useCart } from '../../features/cart/hooks/useCart';
import { CartDrawer } from '../../features/cart/components/CartDrawer';
import { CopilotSidebar } from '../../features/ai/components/CopilotSidebar';
import { trackProductView, trackSearch } from '../../features/ai/store/aiSlice';

export const RootLayout: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { items, toggleCart } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'dark';
  });

  const { pathname } = useLocation();

  // Global scroll reset on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // AI-Native Behavioral Tracking
  React.useEffect(() => {
    // track search intent when url changes
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) dispatch(trackSearch(search));
  }, [window.location.search]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const { isCopilotVisible } = useSelector((state: RootState) => state.ai);

  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <div style={{ 
        flex: 1, 
        position: 'relative'
      }}>
        <header className="app-header ai-glass-panel" style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 90,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 0 var(--border-color)',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                <BrainCircuit size={20} color="white" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Lumina</span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <button 
                onClick={toggleTheme} 
                className="theme-toggle"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>}
              </button>

              <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>Discovery</Link>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={toggleCart} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                  <ShoppingCart size={20} />
                  {items.length > 0 && (
                    <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--brand-primary)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: 'var(--radius-full)', fontWeight: 800, border: '2px solid var(--bg-secondary)' }}>
                      {items.length}
                    </span>
                  )}
                </button>
              </div>

              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', padding: '5px 10px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem' }}>{user?.name[0]}</div>
                    {user?.name.split(' ')[0]}
                  </Link>
                </div>
              ) : (
                <Link to="/login" style={{ background: 'var(--brand-primary)', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '0.8125rem', padding: '8px 16px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>Sign In</Link>
              )}
            </nav>
          </div>
        </header>
        
        <CartDrawer />
        <CopilotSidebar />

        <main className="app-main" style={{ padding: '16px 0 64px 0', maxWidth: '1280px', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <footer className="app-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-elevated)', padding: '64px 0 32px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrainCircuit size={24} color="white" />
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Lumina</span>
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6', maxWidth: '300px' }}>
                Engineering the next generation of commerce. Powered by state-of-the-art secure logistics.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '24px', fontSize: '0.95rem', letterSpacing: '0.02em' }}>SYSTEM</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Discovery Layer</Link></li>
                <li><Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Curated Collections</Link></li>
                <li><Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Global Index</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '24px', fontSize: '0.95rem', letterSpacing: '0.02em' }}>SUPPORT</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Concierge</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Easy Returns</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>API Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '24px', fontSize: '0.95rem', letterSpacing: '0.02em' }}>CONNECT</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Our Vision</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Careers</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Privacy Core</a></li>
              </ul>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '32px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
            <p>&copy; {new Date().getFullYear()} Lumina Inc. Global fulfillment network operational.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
