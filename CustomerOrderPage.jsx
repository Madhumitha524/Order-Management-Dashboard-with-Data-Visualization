import React, { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import OrderForm from '../components/CustomerOrder/OrderForm';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_CLASS = {
  'Pending': 'badge-pending',
  'In progress': 'badge-in-progress',
  'Completed': 'badge-completed',
};

export default function CustomerOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { addToast } = useToast();
  const menuRef = useRef();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll();
      setOrders(res.data.data);
    } catch {
      addToast('Failed to load orders', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSave = async (data) => {
    try {
      if (editOrder) {
        await ordersAPI.update(editOrder._id, data);
        addToast('Order updated successfully');
      } else {
        await ordersAPI.create(data);
        addToast('Order created successfully');
      }
      setShowForm(false); setEditOrder(null);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save order', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await ordersAPI.delete(deleteTarget._id);
      addToast('Order deleted');
      setDeleteTarget(null);
      fetchOrders();
    } catch {
      addToast('Failed to delete order', 'error');
    }
  };

  const openEdit = (order) => { setEditOrder(order); setShowForm(true); setContextMenu(null); };
  const openDelete = (order) => { setDeleteTarget(order); setContextMenu(null); };

  return (
    <div style={{ padding: '28px', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>Customer Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditOrder(null); setShowForm(true); }}>
          <span>+</span> Create Order
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No orders yet</div>
            <div className="empty-desc">Click "Create Order" to add your first customer order.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' }}>
                      {order.orderId}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {order.firstName} {order.lastName}
                    </td>
                    <td>{order.emailId}</td>
                    <td>{order.product}</td>
                    <td style={{ textAlign: 'center' }}>{order.quantity}</td>
                    <td>${Number(order.unitPrice).toFixed(2)}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>${Number(order.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[order.status] || 'badge-pending'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.createdBy}</td>
                    <td style={{ fontSize: '12px' }}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className="btn btn-icon btn-ghost"
                        style={{ fontSize: '18px' }}
                        onClick={e => {
                          e.stopPropagation();
                          setContextMenu({ order, x: e.clientX, y: e.clientY });
                        }}
                      >⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow)',
            zIndex: 2000,
            minWidth: '140px',
            overflow: 'hidden',
          }}
        >
          <button
            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
            onClick={() => openEdit(contextMenu.order)}
          >
            ✏️ Edit
          </button>
          <button
            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--danger-dim)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
            onClick={() => openDelete(contextMenu.order)}
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <OrderForm
          order={editOrder}
          onClose={() => { setShowForm(false); setEditOrder(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Order"
          message={`Are you sure you want to delete order ${deleteTarget.orderId}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
