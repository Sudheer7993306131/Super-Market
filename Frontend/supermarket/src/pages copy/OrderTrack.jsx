import React from "react";
import { useParams } from "react-router-dom";
import ordersData from "../data/ordersData";
import "./OrderTrack.css";

const OrderTrack = () => {
  const { id } = useParams();
  const order = ordersData.find((o) => o.id === parseInt(id));

  if (!order) return <h2>Order Not Found</h2>;

  return (
    <div className="track-container">
      <h2>Track Order #{id}</h2>

      <div className="tracking-steps">
        <div className="step completed">Order Confirmed</div>
        <div className={`step ${order.status !== 'Processing' ? "completed" : ""}`}>Shipped</div>
        <div className={`step ${order.status === 'Delivered' ? "completed" : ""}`}>
          Delivered
        </div>
      </div>

      <p>Delivery by {order.deliveryDate}</p>
    </div>
  );
};

export default OrderTrack;
