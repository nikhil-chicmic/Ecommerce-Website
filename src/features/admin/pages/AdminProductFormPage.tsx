import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { useProduct } from '../../products/hooks/useProducts';
import type { Product } from '../../products/types';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { createProduct, updateProduct, isCreating, isUpdating } = useAdminProducts();
  const { data: existingProduct, isLoading } = useProduct(id || '');

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'custom',
    thumbnail: 'https://via.placeholder.com/300',
  });

  useEffect(() => {
    if (isEditMode && existingProduct) {
      setFormData(existingProduct);
    }
  }, [isEditMode, existingProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && id) {
        await updateProduct({ id, data: formData });
      } else {
        await createProduct(formData as any);
      }
      navigate('/admin/products');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isEditMode && isLoading) return <div>Loading product data...</div>;

  const isSubmitting = isCreating || isUpdating;

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="admin-header">
        <h1 style={{ fontSize: '1.5rem' }}>{isEditMode ? 'Edit Product' : 'Create New Product'}</h1>
      </div>

      <div className="checkout-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <input name="category" value={formData.category} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}>
            <button type="button" className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting} style={{ marginTop: 0 }}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
