import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa'; // Import heart icon from react-icons

const ProductsPage = ({ userId = 1 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]); // store wishlist product IDs

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products/');
        setProducts(response.data);
        setLoading(false);

        const initialQuantities = {};
        response.data.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);

        // Fetch wishlist items
        const token = localStorage.getItem("access_token");
        if (token) {
          const wishlistRes = await axios.get(
            'http://localhost:8000/api/wishlist/',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setWishlistItems(wishlistRes.data.map(item => item.product.id));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: value });
  };

  const handleAddToCart = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://localhost:8000/api/cart/add/",
        { product_id: productId, quantity: quantity },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      console.log("Cart updated");
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
    }
  };

  const handleOrderNow = async (productId) => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const quantity = quantities[productId] || 1;

    if (!token) {
      alert('You must log in first!');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/cart/add/',
        { user_id: userId, product_id: productId, quantity: quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        'http://localhost:8000/api/order/place/',
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Order placed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleAddToWishlist = async (productId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must log in to add to wishlist!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/wishlist/add/",
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      // Update local wishlist state
      setWishlistItems(prev => [...prev, productId]);
      alert("Product added to wishlist!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to wishlist.");
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 20 }}>
      {products.map((product) => (
        <div key={product.id} style={{ border: '1px solid #ddd', padding: 20, width: 220, borderRadius: 8, textAlign: 'center', position: 'relative' }}>
          
          {/* Wishlist Icon */}
          <FaHeart
            onClick={() => handleAddToWishlist(product.id)}
            color={wishlistItems.includes(product.id) ? 'red' : 'gray'}
            size={20}
            style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }}
          />

          {/* Product Image */}
          {product.product_image && (
            <img
              src={`http://localhost:8000${product.product_image}`}
              alt={product.name}
              style={{ width: '100%', height: 150, objectFit: 'contain', marginBottom: 10, borderRadius: 6 }}
            />
          )}

          <h3>{product.name}</h3>
          <p>Category: {product.category.name}</p>
          <p>Price: ₹{product.price}</p>
          <p>Stock: {product.stock}</p>
          <p style={{ fontSize: '12px', color: '#555' }}>{product.description}</p>

          <div style={{ marginTop: 10 }}>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantities[product.id] || 1}
              onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
              style={{ width: 60, marginRight: 10 }}
            />
            <button onClick={() => handleAddToCart(product.id, quantities[product.id])} style={{ padding: '5px 10px', marginRight: 5 }}>
              Add to Cart
            </button>
            <button onClick={() => handleOrderNow(product.id)} style={{ padding: '5px 10px' }}>
              Order Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsPage;
