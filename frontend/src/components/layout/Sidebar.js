import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaShoppingCart, 
  FaChartBar, 
  FaCog,
  FaCalendarAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>System Zamówień</h3>
      </div>
      
      <ul className="list-unstyled components">
        <li>
          <NavLink 
            to="/" 
            className={({isActive}) => isActive ? 'active' : ''}
            end
          >
            <span className="icon"><FaHome /></span>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/orders" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            <span className="icon"><FaShoppingCart /></span>
            <span>Zamówienia</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/scheduling" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            <span className="icon"><FaCalendarAlt /></span>
            <span>Harmonogram</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/reports" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            <span className="icon"><FaChartBar /></span>
            <span>Raporty</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/settings" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            <span className="icon"><FaCog /></span>
            <span>Ustawienia</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;