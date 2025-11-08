
import AdminDashboard from './pages/admindash'
import AdminLogin from './auth/login'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
