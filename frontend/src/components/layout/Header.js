import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { authService } from '../../services/auth';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="app-header">
      <Container fluid>
        <Navbar.Brand href="/">System Zarządzania Zamówieniami</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <FaUser className="me-2" />
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              } 
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item disabled>
                <small className="text-muted">Zalogowany jako</small>
                <br />
                <strong>{currentUser.username}</strong>
                <span className="ms-2 badge bg-secondary">{currentUser.role}</span>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              {currentUser.role === 'Admin' && (
                <NavDropdown.Item href="/settings">
                  <FaCog className="me-2" /> Ustawienia
                </NavDropdown.Item>
              )}
              <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" /> Wyloguj
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;