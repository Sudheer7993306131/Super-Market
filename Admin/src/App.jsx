
import AdminDashboard from './pages/admindash'
import AdminLogin from './auth/login'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/dash" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
