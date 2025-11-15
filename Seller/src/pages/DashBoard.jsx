import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashBoard.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivities: [],
    isLoading: true,
    error: null
  });
  const [user, setUser] = useState(null);

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add new item to your store',
      icon: '➕',
      link: '/seller/add-product',
      color: 'primary'
    },
    {
      title: 'My Products',
      description: 'Manage your products',
      icon: '📦',
      link: '/seller/products',
      color: 'secondary'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: '📋',
      link: '/seller/orders',
      color: 'success'
    },
    {
      title: 'Store Settings',
      description: 'Configure your store',
      icon: '⚙️',
      link: '/settings',
      color: 'info'
    }
  ];

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/seller/login');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/seller/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setDashboardData({
        stats: response.data.stats || [],
        recentActivities: response.data.recent_activities || [],
        isLoading: false,
        error: null
      });

      setUser(response.data.user);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load dashboard data'
      }));

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/seller/login');
      }
    }
  };

  // Fetch seller profile
  const fetchSellerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://127.0.0.1:8000/api/seller/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(response.data);

    } catch (error) {
      console.error('Error fetching seller profile:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSellerProfile();
  }, []);

  // Default stats in case backend doesn't provide data
  const defaultStats = [
    { 
      title: 'Total Products', 
      value: '0', 
      change: '+0%', 
      color: 'green',
      icon: '📦',
      description: 'Active in store',
      key: 'total_products'
    },
    { 
      title: 'Pending Orders', 
      value: '0', 
      change: '+0%', 
      color: 'blue',
      icon: '⏳',
      description: 'Need attention',
      key: 'pending_orders'
    },
    { 
      title: 'Completed Orders', 
      value: '0', 
      change: '+0%', 
      color: 'purple',
      icon: '✅',
      description: 'This month',
      key: 'completed_orders'
    },
    { 
      title: 'Total Revenue', 
      value: '0', 
      change: '+0%', 
      color: 'orange',
      icon: '💰',
      description: 'All time sales',
      key: 'total_revenue'
    }
  ];

  // Merge backend data with default stats
  const getStatsData = () => {
    if (!dashboardData.stats || dashboardData.stats.length === 0) {
      return defaultStats;
    }

    return defaultStats.map(defaultStat => {
      const backendStat = dashboardData.stats.find(s => s.key === defaultStat.key);
      return backendStat ? { ...defaultStat, ...backendStat } : defaultStat;
    });
  };

  // Default activities
  const defaultActivities = [
    { 
      id: 1, 
      activity: 'Welcome to your dashboard!', 
      time: 'Just now', 
      type: 'info',
      status: 'info'
    }
  ];

  const getActivitiesData = () => {
    return dashboardData.recentActivities.length > 0 
      ? dashboardData.recentActivities 
      : defaultActivities;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/seller/login');
  };

  if (dashboardData.isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load dashboard</h3>
          <p>{dashboardData.error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting">
                <h1>Welcome back, {user?.username || 'Seller'}! 👋</h1>
                <p>Here's what's happening with your store today.</p>
              </div>
              <div className="date-display">
                <span className="current-date">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                {user?.store_name && (
                  <span className="store-name">Store: {user.store_name}</span>
                )}
              </div>
            </div>
            <div className="header-actions">
              <div className="action-buttons">
                <Link to="/seller/add-product" className="btn btn-primary">
                  <span className="btn-icon">+</span>
                  Add New Product
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <section className="stats-section">
          <div className="section-header">
            <h2>Business Overview</h2>
            <span className="section-subtitle">Key performance indicators</span>
          </div>
          <div className="stats-grid">
            {getStatsData().map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className="stat-header">
                  <div className="stat-icon">
                    {stat.icon}
                  </div>
                  <div className={`stat-change ${stat.change.includes('+') ? 'positive' : 'negative'}`}>
                    {stat.change}
                  </div>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-description">{stat.description}</div>
                </div>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${stat.color}`} 
                      style={{width: `${Math.min(100, Math.max(10, parseInt(stat.change) || 0))}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="content-section">
          <div className="content-grid">
            {/* Quick Actions */}
            <div className="content-card quick-actions-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
                <span className="card-subtitle">Manage your store efficiently</span>
              </div>
              <div className="card-content">
                <div className="quick-actions-grid">
                  {quickActions.map((action, index) => (
                    <Link 
                      key={index} 
                      to={action.link} 
                      className={`action-card action-${action.color}`}
                    >
                      <div className="action-icon">
                        {action.icon}
                      </div>
                      <div className="action-content">
                        <div className="action-title">{action.title}</div>
                        <div className="action-description">{action.description}</div>
                      </div>
                      <div className="action-arrow">→</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="content-card activity-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <span className="card-subtitle">Latest store updates</span>
              </div>
              <div className="card-content">
                <div className="activity-timeline">
                  {getActivitiesData().map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-indicator ${activity.status}`}></div>
                      <div className="activity-content">
                        <div className="activity-text">{activity.activity}</div>
                        <div className="activity-meta">
                          <span className="activity-time">{activity.time}</span>
                          <span className={`activity-type ${activity.type}`}>
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card-footer">
                  <Link to="/seller/orders" className="view-all-link">
                    View all activity →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Metrics */}
        
      </div>
    </div>
  );
};

export default SellerDashboard;