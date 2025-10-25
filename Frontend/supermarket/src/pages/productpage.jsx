import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/product/${id}/`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading product...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!product) return <p style={{ textAlign: "center" }}>No product found</p>;

  // ✅ Correct image URL (in case backend returns relative path)
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `http://127.0.0.1:8000${product.image}`;

  return (
    <div style={{
      maxWidth: 600,
      margin: '50px auto',
      padding: 20,
      border: '1px solid #ddd',
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center',
      backgroundColor: '#fff'
    }}>
      {/* ✅ Product Image */}
      {product.image ? (
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            maxHeight: 350,
            objectFit: 'contain',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        />
      ) : (
        <p style={{ color: '#777' }}>No image available</p>
      )}

      <h1 style={{ color: '#007bff' }}>{product.name}</h1>
      <p><strong>Category:</strong> {product.category?.name || 'N/A'}</p>
      <p><strong>Original Price:</strong> ₹{product.price}</p>

      {product.discount_percentage > 0 && (
        <p style={{ color: 'red' }}>
          <strong>Discounted Price:</strong> ₹{product.discounted_price.toFixed(2)} ({product.discount_percentage}% off)
        </p>
      )}

      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Description:</strong> {product.description}</p>
    </div>
  );
};

export default ProductDetailPage;
