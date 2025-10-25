import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Fetch the cart of the logged-in user
  const fetchCart = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('You must be logged in to view the cart.');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get('http://localhost:8000/api/cart/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Failed to fetch cart. Please try again.');
        console.error(err);
      }
    }
  };

  // ✅ Remove an item from cart
  const handleRemove = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/cart/remove/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(); // Refresh cart after removal
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Failed to remove item from cart.');
        console.error(err);
      }
    }
  };

  if (error) return <h3>{error}</h3>;
  if (!cart) return <h3>Loading Cart...</h3>;

  return (
    <div className="cart-container" style={{ maxWidth: 800, margin: '50px auto' }}>
      <h2>Your Shopping Cart</h2>
      {cart.items?.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.items?.map((item) => (
      <div
        className="cart-item"
        key={item.id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 15,
          border: '1px solid #ddd',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
        }}
      >
        <div>
          <h4>{item.product_name || item.product?.name}</h4>
          <p>Price: ₹{item.discounted_price || item.product?.discounted_price}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
        <button
          // 👇 FIX: use item.product_id if product object not nested
          onClick={() => handleRemove(item.product?.id || item.product_id)}
          style={{
            background: 'red',
            color: '#fff',
            border: 'none',
            padding: '5px 10px',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
      Remove
    </button>
  </div>
))}

          <h3>Total: ₹{cart.total_price}</h3>
        </>
      )}
    </div>
  );
};

export default CartPage;
