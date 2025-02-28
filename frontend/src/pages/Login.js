import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to previous location or dashboard if already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const { from } = location.state || { from: { pathname: '/' } };
      navigate(from);
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Nazwa użytkownika i hasło są wymagane');
      return;
    }
    
    setLoading(true);
    
    try {
      await authService.login(credentials.username, credentials.password);
      
      // Get return url from location state or default to home page
      const { from } = location.state || { from: { pathname: '/' } };
      navigate(from);
    } catch (error) {
      setError('Nieprawidłowa nazwa użytkownika lub hasło');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mb-4">
              <h2>System Zarządzania Zamówieniami</h2>
              <p className="text-muted">Zaloguj się, aby kontynuować</p>
            </div>
            
            <Card>
              <Card.Body className="p-4">
                <h4 className="mb-4 text-center">Logowanie</h4>
                
                {error && (
                  <Alert variant="danger">{error}</Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nazwa użytkownika</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="Wprowadź nazwę użytkownika"
                      autoComplete="username"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Hasło</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Wprowadź hasło"
                      autoComplete="current-password"
                      required
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      className="py-2"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Logowanie...
                        </>
                      ) : (
                        'Zaloguj się'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <p className="text-muted">
                Demo: użytkownik <strong>admin</strong> / hasło <strong>admin123</strong>
                <br />
                lub użytkownik <strong>user</strong> / hasło <strong>user123</strong>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;