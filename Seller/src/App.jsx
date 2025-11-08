
import AddProduct from './pages/addproduct'
import SellerOrders from './pages/sellerorders'
import SellerProducts from './pages/sellerproducts'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerAuth from './auth/auth'
import Navbar from './components/Navbar'
import SellerDashboard from './pages/DashBoard';

function App() {
  

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/" element={<SellerAuth />} />
      </Routes>
    </Router>
  )
}

export default App
