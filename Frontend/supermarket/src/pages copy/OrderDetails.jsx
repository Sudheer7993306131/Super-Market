import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ordersData from "../data/ordersData";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = ordersData.find((o) => o.id === Number(id));

  if (!order) {
    return (
      <div className="details-page">
        <div className="not-found">
          <h2>Order not found</h2>
          <p className="muted">We couldn't find the order you requested.</p>
          <button className="btn btn-primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (d) => 
    d ? new Date(d).toLocaleDateString("en-IN", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    }) : "—";

  const itemList = order.items || [];
  const totalItems = itemList.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Check if order is ongoing (not delivered)
  const isOngoingOrder = order.status.toLowerCase() !== "delivered";

  return (
    <div className="details-page">
      <div className="details-wrap">
        <button className="back-link" onClick={() => navigate(-1)}>
          ← Back to Orders
        </button>

        <header className="details-header">
          <div>
            <h1>Order #{order.id}</h1>
            <p className="muted">Placed on {formatDate(order.date)} · {totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          <div className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
            {order.status}
          </div>
        </header>

        <section className="details-grid">
          <div className="left-col">
            {/* Products */}
            <div className="card">
              <h3>Order Items ({totalItems})</h3>
              <ul className="product-list">
                {itemList.map((it, idx) => (
                  <li key={idx} className="product-row">
                    <img 
                      src={it.image || "/images/placeholder.png"} 
                      alt={it.name}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyNUgzNVYzNUgyNVYyNVoiIGZpbGw9IiNEOEQ4RDgiLz4KPHBhdGggZD0iTTMwIDMwVjUwTTQwIDMwVjUwTTMwIDMwSDQwTTMwIDUwSDQwIiBzdHJva2U9IiNCOEI4QjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K";
                      }}
                    />
                    <div className="prod-info">
                      <div className="pn">{it.name}</div>
                      <div className="prod-details">
                        {it.category && <span className="category">{it.category}</span>}
                        {it.size && <span className="size">Size: {it.size}</span>}
                        {it.color && <span className="color">Color: {it.color}</span>}
                      </div>
                      <div className="qty-price">
                        Quantity: {it.quantity} · ₹{it.price} × {it.quantity} = ₹{(it.price * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Dates with Horizontal Line */}
            <div className="card">
              <h3>Order Timeline</h3>
              <div className="horizontal-timeline">
                <div className="timeline-item">
                  <div className="timeline-marker confirmed"></div>
                  <div className="timeline-content">
                    <span className="timeline-label">Order Confirmed</span>
                    <span className="timeline-date">{formatDate(order.date)}</span>
                  </div>
                </div>
                
                <div className="horizontal-connector"></div>
                
                <div className="timeline-item">
                  <div className={`timeline-marker ${order.status.toLowerCase() === 'delivered' ? 'delivered' : 'pending'}`}></div>
                  <div className="timeline-content">
                    <span className="timeline-label">
                      {order.status.toLowerCase() === "delivered" ? "Delivered" : "Estimated Delivery"}
                    </span>
                    <span className="timeline-date">{formatDate(order.deliveryDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="card">
              <h3>Delivery Information</h3>
              <div>
                <span className="muted">Delivery Address</span>
                <p>{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          <aside className="right-col">
            {/* Price Summary */}
            <div className="card">
              <h3>Price Summary</h3>
              <div className="price-row">
                <span>Items ({totalItems})</span>
                <strong>₹{order.total}</strong>
              </div>
              <div className="price-row">
                <span>Shipping Fee</span>
                <strong style={{color: '#10b981'}}>FREE</strong>
              </div>
              <div className="price-row">
                <span>Tax (18%)</span>
                <strong>₹{(order.total * 0.18).toFixed(2)}</strong>
              </div>
              <div className="divider" />
              <div className="price-row total">
                <span>Total Amount</span>
                <strong>₹{(order.total * 1.18).toFixed(2)}</strong>
              </div>
            </div>

            {/* Order Information */}
            <div className="card">
              <h3>Order Information</h3>
              <div>
                <span className="muted">Order ID</span>
                <p>#{order.id}</p>
              </div>
              <div>
                <span className="muted">Order Date</span>
                <p>{formatDate(order.date)}</p>
              </div>
              <div>
                <span className="muted">Order Status</span>
                <p>{order.status}</p>
              </div>
            </div>

            {/* Track Order Button - Only show for ongoing orders */}
            {isOngoingOrder && (
              <div className="card">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate(`/order-track/${order.id}`)}
                >
                  Track Order
                </button>
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
};

export default OrderDetails;