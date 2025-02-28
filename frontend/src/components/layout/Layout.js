import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Container } from 'react-bootstrap';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      <div className="layout-container">
        <Sidebar />
        <div className="content">
          <Container fluid className="p-4">
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Layout;