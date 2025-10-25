import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to view orders.');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get('http://localhost:8000/api/orders/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Failed to load orders. Try again later.');
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '50px auto' }}>
      <h2>Your Orders</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 6,
              marginBottom: 15,
              padding: 10,
            }}
          >
            <h4>Order #{order.id}</h4>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.total_price}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <div style={{ marginTop: 10 }}>
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.product_name} — ₹{item.discounted_price} × {item.quantity}
                </p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderPage;
