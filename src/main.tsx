import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './store';
import { queryClient } from './config/queryClient';
import { GlobalErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './features/auth/components/AuthProvider';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ToastProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
