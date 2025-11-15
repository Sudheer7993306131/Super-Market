import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token"); // Admin JWT token
      if (!token) {
        setError("You must be logged in as admin.");
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/api/ordersall/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="admin-orders-empty">
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <h1>All Orders</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer_name}</td>
              <td>{order.customer_email}</td>
              <td>₹{order.total_price}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrdersPage;
