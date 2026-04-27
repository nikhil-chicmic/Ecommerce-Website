import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => addToast('success', title, message), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast('error', title, message), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast('info', title, message), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {createPortal(
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
        }}>
          <style>{`
            @keyframes toast-slide-in {
              from { opacity: 0; transform: translateX(100%); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes toast-progress {
              from { width: 100%; }
              to { width: 0%; }
            }
            .toast-item {
              animation: toast-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}</style>
          
          {toasts.map((t) => (
            <div key={t.id} className="toast-item" style={{
              pointerEvents: 'auto',
              background: '#0F111A', // Darker midnight blue
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              width: '340px',
              position: 'relative',
              overflow: 'hidden',
              padding: '16px',
              display: 'flex',
              gap: '12px',
            }}>
              {/* Progress Bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                background: t.type === 'error' ? '#EF4444' : t.type === 'success' ? '#10B981' : '#3B82F6',
                animation: 'toast-progress 5s linear forwards',
                opacity: 0.8
              }} />

              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: t.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : t.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {t.type === 'success' && <CheckCircle2 size={22} color="#10B981" />}
                {t.type === 'error' && <AlertCircle size={22} color="#EF4444" />}
                {t.type === 'info' && <Info size={22} color="#3B82F6" />}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  margin: '0 0 4px 0', 
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em'
                }}>
                  {t.title}
                </h4>
                {t.message && (
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {t.message}
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => removeToast(t.id)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer', padding: '4px', display: 'flex', alignSelf: 'flex-start', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
