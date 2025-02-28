import React from 'react';
import Sidebar from './Sidebar';
import { Container } from 'react-bootstrap';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="content">
        <Container fluid className="p-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout;