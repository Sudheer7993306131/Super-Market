import React, { useEffect, useState } from "react";
import axios from "axios";
import './admindash.css';

const API_BASE = "http://127.0.0.1:8000/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    sellers: 0,
    agents: 0
  });
  const token = localStorage.getItem("token");

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      calculateStats();
    }
  }, [users, products]);

  const calculateStats = () => {
    const sellers = users.filter(u => u.is_seller).length;
    const agents = users.filter(u => u.is_delivery_agent).length;
    setStats({
      totalUsers: users.length,
      totalProducts: products.length,
      sellers,
      agents
    });
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/users/`, { headers: authHeader });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users (are you admin?)");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/products/`, { headers: authHeader });
      console.log(res.data)
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const promoteToSeller = async (userId, username) => {
    const store_name = window.prompt(`Enter store name for ${username}:`);
    if (store_name === null) return;
    
    try {
      await axios.post(`${API_BASE}/admin/users/${userId}/promote/seller/`, { store_name }, { headers: authHeader });
      alert("User promoted to seller successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Promotion failed");
    }
  };

  const promoteToAgent = async (userId, username) => {
    const phone = window.prompt(`Enter phone number for ${username}:`);
    if (phone === null) return;
    
    try {
      await axios.post(`${API_BASE}/admin/users/${userId}/promote/agent/`, { phone }, { headers: authHeader });
      alert("User promoted to delivery agent successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Promotion failed");
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return;
    
    try {
      await axios.delete(`${API_BASE}/admin/products/${productId}/delete/`, { headers: authHeader });
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This will permanently remove the user and all related data.`)) return;
    
    try {
      await axios.delete(`${API_BASE}/admin/users/${userId}/delete/`, { headers: authHeader });
      alert("User deleted successfully!");
      fetchUsers();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const StatusBadge = ({ type, value }) => {
    const getStatusConfig = (type, value) => {
      const configs = {
        seller: { 
          true: { label: "Seller", class: "success" }, 
          false: { label: "Customer", class: "default" } 
        },
        agent: { 
          true: { label: "Agent", class: "info" }, 
          false: { label: "Not Agent", class: "default" } 
        }
      };
      return configs[type][value] || { label: "Unknown", class: "default" };
    };

    const config = getStatusConfig(type, value);
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const ActionButton = ({ onClick, variant = "primary", children, icon }) => (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="admin-icon">⚙️</span>
            Admin Dashboard
          </h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => { fetchUsers(); fetchProducts(); }}>
              <span className="refresh-icon">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <div className="nav-tabs">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "users", label: "User Management", icon: "👥" },
            { id: "products", label: "Product Management", icon: "📦" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="admin-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon users">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon products">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon sellers">🏪</div>
                <div className="stat-info">
                  <h3>{stats.sellers}</h3>
                  <p>Sellers</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon agents">🚚</div>
                <div className="stat-info">
                  <h3>{stats.agents}</h3>
                  <p>Delivery Agents</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-card" onClick={() => setActiveTab("users")}>
                  <span className="action-icon">👥</span>
                  <span className="action-text">Manage Users</span>
                </button>
                <button className="action-card" onClick={() => setActiveTab("products")}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Manage Products</span>
                </button>
                <button className="action-card" onClick={() => { fetchUsers(); fetchProducts(); }}>
                  <span className="action-icon">🔄</span>
                  <span className="action-text">Refresh Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>User Management</h2>
              <p>Manage user roles and permissions</p>
            </div>
            
            {loadingUsers ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Roles</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                              <strong>{user.username}</strong>
                              <span>ID: {user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{user.email || 'No email'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="role-badges">
                            <StatusBadge type="seller" value={user.is_seller} />
                            <StatusBadge type="agent" value={user.is_delivery_agent} />
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!user.is_seller && (
                              <ActionButton 
                                onClick={() => promoteToSeller(user.id, user.username)}
                                variant="success"
                                icon="🏪"
                              >
                                Make Seller
                              </ActionButton>
                            )}
                            {!user.is_delivery_agent && (
                              <ActionButton 
                                onClick={() => promoteToAgent(user.id, user.username)}
                                variant="info"
                                icon="🚚"
                              >
                                Make Agent
                              </ActionButton>
                            )}
                            <ActionButton 
                              onClick={() => deleteUser(user.id, user.username)}
                              variant="danger"
                              icon="🗑️"
                            >
                              Delete
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="products-tab">
            <div className="tab-header">
              <h2>Product Management</h2>
              <p>Manage products and inventory</p>
            </div>
            
            {loadingProducts ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Seller</th>
                      <th>Price & Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-info">
                            <div className="product-avatar">📦</div>
                            <div className="product-details">
                              <strong>{product.name}</strong>
                              <span>ID: {product.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="seller-info">
                            {product.seller_name || 'No seller'}
                          </div>
                        </td>
                        <td>
                          <div className="price-stock">
                            <div className="price">₹{product.price}</div>
                            <div className="stock">
                              <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <ActionButton 
                              onClick={() => deleteProduct(product.id, product.name)}
                              variant="danger"
                              icon="🗑️"
                            >
                              Delete
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;