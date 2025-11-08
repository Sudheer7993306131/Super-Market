import React, { useState, useEffect } from "react";
import ordersData from "../data/ordersData";
import "./MyOrders.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTruck, 
  faCircleCheck, 
  faHourglassHalf, 
  faTimesCircle,
  faSearch,
  faFilter
} from "@fortawesome/free-solid-svg-icons";

const statusIcon = (status) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return faCircleCheck;
  if (s.includes("transit") || s.includes("shipped")) return faTruck;
  if (s.includes("processing")) return faHourglassHalf;
  return faTimesCircle;
};

const getStatusClass = (status) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "delivered";
  if (s.includes("transit") || s.includes("shipped")) return "shipped";
  if (s.includes("processing")) return "processing";
  if (s.includes("cancelled")) return "cancelled";
  return "pending";
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setOrders(ordersData);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || 
                         order.status.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = order.items[0].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>

      {/* Search and Filter Section */}
      <div className="orders-controls">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <FontAwesomeIcon icon={faFilter} className="filter-icon" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="delivered">Delivered</option>
            <option value="shipped">Shipped</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>{searchTerm || filter !== "all" ? "Try adjusting your search or filter" : "Start shopping to see your orders here"}</p>
          {!searchTerm && filter === "all" && (
            <button className="continue-shopping-btn">
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <img 
                src={order.items[0].image} 
                alt={order.items[0].name} 
                className="order-img"
              />

              <div className="order-info">
                <h3 className="order-product">{order.items[0].name}</h3>
                {order.items.length > 1 && (
                  <div className="multiple-items">
                    +{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}
                  </div>
                )}
                
                <div className="order-meta">
                  <span className="order-id">#{order.id}</span>
                  <span className="order-date">{formatDate(order.date)}</span>
                </div>

                <p className="order-price">₹{order.total}</p>

                <p className={`order-status ${getStatusClass(order.status)}`}>
                  <FontAwesomeIcon icon={statusIcon(order.status)} /> 
                  {order.status}
                </p>

                <p className="order-address">
                  {order.shippingAddress}
                </p>
              </div>

              <div className="order-actions">
                <button className="btn-details">
                  Details
                </button>
                {!order.status.toLowerCase().includes("cancelled") && (
                  <button className="btn-track">
                    Track
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;