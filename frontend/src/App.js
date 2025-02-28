import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import ProductionScheduling from './pages/ProductionScheduling';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/production" element={<ProductionScheduling />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;