import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useProducts } from '../../products/hooks/useProducts';
import { useAdminProducts } from '../hooks/useAdminProducts';

export const AdminProductsPage: React.FC = () => {
  // We use the same hook as the frontend to ensure we see exactly what users see
  const { data, isLoading } = useProducts(0, 100, {}); 
  const { deleteProduct } = useAdminProducts();
  const navigate = useNavigate();

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this custom product?')) {
      try {
        await deleteProduct(id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-1)' }}>Product Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your catalog and add custom items</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
          onClick={() => navigate('/admin/products/new')}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : data?.products.map(product => (
              <tr key={product.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <img src={product.thumbnail} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 500 }}>{product.title}</span>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  {product.isCustom ? (
                    <span style={{ color: 'var(--brand-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>Custom</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DummyJSON</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {product.isCustom ? (
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                      <button className="action-btn edit" title="Edit" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" title="Delete" onClick={() => handleDelete(product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read-only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
