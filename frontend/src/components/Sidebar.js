import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/production">Production Scheduling</Link></li>
      </ul>
    </nav>
  );
};