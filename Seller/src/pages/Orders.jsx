// src/pages/Orders.jsx
import React, { useState } from 'react';
import { Store, LogOut, Search, Filter, Package, Truck, CheckCircle } from 'lucide-react';

const Orders = ({ user, onLogout, onNavigate }) => {
  const [orders, setOrders] = useState([
    {
      id: '#ORD-001',
      customer: 'Amit Sharma',
      product: 'Organic Apples',
      quantity: 3,
      amount: '₹540',
      status: 'Pending',
      date: '2024-01-20',
      address: '123 Main St, Mumbai'
    },
    {
      id: '#ORD-002',
      customer: 'Priya Patel',
      product: 'Fresh Milk',
      quantity: 2,
      amount: '₹120',
      status: 'Shipped',
      date: '2024-01-19',
      address: '456 Park Ave, Delhi'
    },
    {
      id: '#ORD-003',
      customer: 'Rahul Verma',
      product: 'Whole Wheat Bread',
      quantity: 1,
      amount: '₹45',
      status: 'Delivered',
      date: '2024-01-18',
      address: '789 Green Rd, Bangalore'
    },
    {
      id: '#ORD-004',
      customer: 'Sneha Singh',
      product: 'Free Range Eggs',
      quantity: 2,
      amount: '₹240',
      status: 'Pending',
      date: '2024-01-20',
      address: '321 Lake View, Pune'
    },
    {
      id: '#ORD-005',
      customer: 'Kiran Mehta',
      product: 'Organic Apples',
      quantity: 1,
      amount: '₹180',
      status: 'Shipped',
      date: '2024-01-19',
      address: '654 Hill Road, Hyderabad'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Package size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="orders-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Order Management</h1>
            <p className="page-subtitle">Manage and track your orders</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <Store size={20} />
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-shop">{user?.shopName}</span>
              </div>
            </div>
            <button onClick={onLogout} className="logout-button">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="page-nav">
        <button onClick={() => onNavigate('dashboard')} className="nav-button">
          Dashboard
        </button>
        <button onClick={() => onNavigate('products')} className="nav-button">
          Products
        </button>
        <button onClick={() => onNavigate('orders')} className="nav-button active">
          Orders
        </button>
      </nav>

      {/* Filters and Search */}
      <div className="orders-controls">
        <div className="search-box">
          <Search size={20} />
          <input type="text" placeholder="Search orders..." className="search-input" />
        </div>
        
        <div className="filter-buttons">
          <button 
            onClick={() => setFilter('all')} 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('shipped')} 
            className={`filter-button ${filter === 'shipped' ? 'active' : ''}`}
          >
            Shipped
          </button>
          <button 
            onClick={() => setFilter('delivered')} 
            className={`filter-button ${filter === 'delivered' ? 'active' : ''}`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.map((order, index) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-id">{order.id}</div>
              <div className="order-date">{order.date}</div>
            </div>
            
            <div className="order-details">
              <div className="customer-info">
                <h3 className="customer-name">{order.customer}</h3>
                <p className="customer-address">{order.address}</p>
              </div>
              
              <div className="product-info">
                <h4 className="product-name">{order.product}</h4>
                <p className="product-quantity">Quantity: {order.quantity}</p>
              </div>
              
              <div className="order-amount">
                <span className="amount">{order.amount}</span>
              </div>
            </div>
            
            <div className="order-footer">
              <div className={`order-status ${order.status.toLowerCase()}`}>
                {getStatusIcon(order.status)}
                <span>{order.status}</span>
              </div>
              
              <div className="order-actions">
                {order.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Shipped')}
                      className="action-button primary"
                    >
                      Mark as Shipped
                    </button>
                    <button className="action-button secondary">
                      View Details
                    </button>
                  </>
                )}
                {order.status === 'Shipped' && (
                  <>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="action-button primary"
                    >
                      Mark as Delivered
                    </button>
                    <button className="action-button secondary">
                      Track Order
                    </button>
                  </>
                )}
                {order.status === 'Delivered' && (
                  <button className="action-button secondary">
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h3>No orders found</h3>
          <p>There are no orders matching your current filter.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;