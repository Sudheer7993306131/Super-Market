import { useState } from 'react'
import DeliveryAgentDashboard from './pages/DeliveryAgentDashboard'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveryAgentLogin from './auth/login';

function App() {
  const [count, setCount] = useState(0)

  return (
  <Router>
    <Routes>
      <Route path="/dash" element={<DeliveryAgentDashboard />} />
      <Route path="/login" element={<DeliveryAgentLogin />} />
    </Routes>
  </Router>
  )
}

export default App
