import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ordersData from "../data/ordersData";
import "./TrackOrder.css";

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = ordersData.find((o) => o.id === Number(id));

  if (!order) {
    return (
      <div className="track-order-page">
        <div className="not-found">
          <h2>Order not found</h2>
          <button className="btn btn-primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const getTrackingSteps = (order) => {
    const baseSteps = [
      { stage: "Order Confirmed", status: "completed", date: order.date, icon: "✓" },
      { stage: "Processing", status: order.status === "processing" ? "current" : "completed", date: order.processingDate, icon: "⚙️" },
      { stage: "Shipped", status: order.status === "shipped" || order.status === "in transit" ? "current" : order.status === "delivered" ? "completed" : "pending", date: order.shippedDate, icon: "🚚" },
      { stage: "Out for Delivery", status: order.status === "out for delivery" ? "current" : order.status === "delivered" ? "completed" : "pending", date: order.outForDeliveryDate, icon: "📦" },
      { stage: "Delivered", status: order.status === "delivered" ? "completed" : "pending", date: order.deliveredDate, icon: "🏠" }
    ];

    return baseSteps.filter(step => step.status !== "pending" || step.stage === "Delivered");
  };

  const trackingSteps = getTrackingSteps(order);

  return (
    <div className="track-order-page">
      <div className="track-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Order Details
        </button>

        <header className="track-header">
          <div>
            <h1>Track Your Order</h1>
            <p className="order-number">Order #${order.id}</p>
          </div>
          <div className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
            {order.status}
          </div>
        </header>

        <div className="tracking-card">
          <div className="tracking-progress">
            {trackingSteps.map((step, index) => (
              <div key={index} className={`progress-step ${step.status}`}>
                <div className="step-indicator">
                  <span className="step-icon">{step.icon}</span>
                </div>
                <div className="step-content">
                  <h4>{step.stage}</h4>
                  <p>{step.date ? new Date(step.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }) : "Pending"}</p>
                </div>
                {index < trackingSteps.length - 1 && (
                  <div className="step-connector"></div>
                )}
              </div>
            ))}
          </div>

          <div className="delivery-info">
            <div className="estimated-delivery">
              <span className="info-label">Estimated Delivery</span>
              <span className="info-value">
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }) : "To be confirmed"}
              </span>
            </div>
            <div className="delivery-address">
              <span className="info-label">Delivery Address</span>
              <span className="info-value">{order.shippingAddress}</span>
            </div>
          </div>

          <div className="track-actions">
            <button className="btn secondary" onClick={() => navigate(`/order-details/${order.id}`)}>
              View Order Details
            </button>
            <button className="btn primary" onClick={() => alert("Connecting to support...")}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;