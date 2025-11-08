import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './authentication/login';
import RegisterPage from './authentication/register';
import HomePage from './pages/home';
import ProductsPage from './pages/product';
import ProductDetailPage from './pages/productpage';
import CategoryProductsPage from './pages/Category';
import CategoryDetailPage from './pages/Categorydetails';
import SubCategoryPage from './pages/subcategory';
import CartPage from './pages/cartpage';
import OrdersPage from './pages/orders';
import ProtectedRoute from './authentication/protectroute';
import WishlistPage from './pages/wishlist';
import Navbar from './components/Navbar';
import Secondarynav from './components/Secondarynav';



function App() {
  return (
    <Router>
      <Navbar />
      <Secondarynav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/subcategory/:subcategoryName" element={<ProductsPage />} />

        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoryProductsPage />} />
        <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
        <Route path="/subcategory/:subcategoryName" element={<SubCategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/wish" element={<WishlistPage />} />




        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
      
      </Routes>
    </Router>
  );
}

export default App;
