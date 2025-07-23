import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';

const initialForm = { name: '', sku: '', price: '', is_bundle: false };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch products
  const fetchProducts = () => {
    setLoading(true);
    api.get('/api/products')
      .then(res => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch products.');
        setLoading(false);
        toast.error('Failed to fetch products from backend.');
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal for add/edit
  const openModal = (mode, product = null) => {
    setModalMode(mode);
    setShowModal(true);
    if (mode === 'edit' && product) {
      setForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        is_bundle: product.is_bundle || false,
      });
      setEditingId(product.id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
  };

  // Handle form input
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Submit add/edit
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await api.post('/api/products', {
          ...form,
          price: parseFloat(form.price),
        });
        toast.success('Product added!');
      } else {
        await api.put(`/api/products/${editingId}`, {
          ...form,
          price: parseFloat(form.price),
        });
        toast.success('Product updated!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted!');
      fetchProducts();
    } catch (err) {
      toast.error('Error deleting product.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => openModal('add')}>
          + Add Product
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-warning">{error}</div>}
      <motion.table className="table table-striped table-hover" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Bundle?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className={p.stock === 0 ? 'table-danger' : ''}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>${parseFloat(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>{p.is_bundle ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('edit', p)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-control" name="sku" value={form.sku} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input type="number" step="0.01" className="form-control" name="price" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" name="is_bundle" checked={form.is_bundle} onChange={handleChange} id="is_bundle" />
                  <label className="form-check-label" htmlFor="is_bundle">Is Bundle?</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 