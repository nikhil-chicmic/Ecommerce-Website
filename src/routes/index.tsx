import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { CheckoutPage } from '../features/payment/pages/CheckoutPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AdminLayout } from '../features/admin/components/AdminLayout';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';
import { AdminProductFormPage } from '../features/admin/pages/AdminProductFormPage';
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage';

import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { ProductDetailsPage } from '../features/products/pages/ProductDetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ProductsPage />,
      },
      {
        path: 'product/:id',
        element: <ProductDetailsPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'products/new', element: <AdminProductFormPage /> },
          { path: 'products/edit/:id', element: <AdminProductFormPage /> },
          { path: 'settings', element: <div style={{ padding: '2rem' }}>Settings Placeholder</div> },
        ],
      },
      {
        path: '*',
        element: (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>404 - Not Found</h2>
            <p>The page you are looking for does not exist.</p>
          </div>
        ),
      }
    ],
  },
]);
