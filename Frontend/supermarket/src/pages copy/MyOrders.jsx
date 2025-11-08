import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ordersData from "../data/ordersData";
import "./MyOrders.css";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setOrders(ordersData);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    }) : "—";

  const filtered = orders.filter((o) => {
    const okFilter = filter === "all" || o.status.toLowerCase().includes(filter.toLowerCase());
    const mainName = (o.items?.[0]?.name || "").toLowerCase();
    const term = search.trim().toLowerCase();
    const okSearch = !term || mainName.includes(term) || o.id.toString().includes(term);
    return okFilter && okSearch;
  });

  const getStatusClass = (status) => {
    const s = status.toLowerCase().replace(/\s+/g, "-");
    if (s.includes("delivered")) return "delivered";
    if (s.includes("transit")) return "in-transit";
    if (s.includes("processing")) return "processing";
    if (s.includes("cancelled")) return "cancelled";
    return "processing";
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-wrap">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-wrap">
        <header className="orders-header">
          <div>
            <h1>My Orders</h1>
            <p className="muted">Track purchases, delivery status and order details</p>
          </div>

          <div className="controls">
            <div className="search-box">
              <input
                type="search"
                placeholder="Search order by product name or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search orders"
              />
            </div>

            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              aria-label="Filter orders"
            >
              <option value="all">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="in transit">In Transit</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </header>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p className="muted">
              {search || filter !== "all" 
                ? "Try adjusting your search or filter." 
                : "You have no orders yet. Start shopping to see your orders here!"}
            </p>
            {!search && filter === "all" && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/")}
                style={{ marginTop: "16px" }}
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <main className="orders-list">
            {filtered.map((order, index) => (
              <article 
                className="order-card" 
                key={order.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={order.items?.[0]?.image || "/images/placeholder.png"}
                  alt={order.items?.[0]?.name || `Order ${order.id}`}
                  className="order-thumb"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg1MFY1MEgzMFYzMFoiIGZpbGw9IiNEOEQ4RDgiLz4KPHBhdGggZD0iTTM1IDM1VjU1TTQ1IDM1VjU1TTM1IDM1SDQ1TTM1IDU1SDQ1IiBzdHJva2U9IiNCOEI4QjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K";
                  }}
                />

                <div className="order-body">
                  <div className="order-top-row">
                    <h3 className="product-name">{order.items?.[0]?.name}</h3>
                    <div className={`status-pill ${getStatusClass(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="order-meta">
                    <div>
                      <small className="muted">Order ID</small>
                      <div className="meta-value">#{order.id}</div>
                    </div>

                    <div>
                      <small className="muted">Delivery Date</small>
                      <div className="meta-value">{formatDate(order.deliveryDate)}</div>
                    </div>

                    <div>
                      <small className="muted">Total Amount</small>
                      <div className="meta-value">₹{order.total}</div>
                    </div>
                  </div>

                  <div className="order-address">
                    <small className="muted">Delivery Address</small>
                    <div>{order.shippingAddress}</div>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    onClick={() => navigate(`/order-details/${order.id}`)} 
                    className="btn btn-view"
                  >
                    View Details
                  </button>

                  {order.status.toLowerCase() !== "cancelled" && (
                    <button 
                      onClick={() => navigate(`/order-track/${order.id}`)} 
                      className="btn btn-primary"
                    >
                      Track Order
                    </button>
                  )}
                </div>
              </article>
            ))}
          </main>
        )}
      </div>
    </div>
  );
};

export default MyOrders;