import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaShoppingCart, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
  // To będzie zastąpione rzeczywistymi danymi z API
  const stats = {
    totalOrders: 152,
    completedOrders: 98,
    pendingOrders: 54,
  };

  return (
    <div>
      <h1 className="mb-4">Panel główny</h1>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">Wszystkie zamówienia</h5>
                  <p className="text-muted small mb-2">Łączna liczba zamówień</p>
                  <h2>{stats.totalOrders}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaShoppingCart size={30} color="#0d6efd" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">Ukończone</h5>
                  <p className="text-muted small mb-2">Zrealizowane zamówienia</p>
                  <h2>{stats.completedOrders}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaCheckCircle size={30} color="#198754" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">W trakcie</h5>
                  <p className="text-muted small mb-2">Oczekujące zamówienia</p>
                  <h2>{stats.pendingOrders}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FaSpinner size={30} color="#ffc107" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Instrukcja</h5>
            </Card.Header>
            <Card.Body>
              <p>System zarządzania zamówieniami produkcyjnymi umożliwia:</p>
              <ul>
                <li>Dodawanie, edytowanie i usuwanie zamówień</li>
                <li>Definiowanie niestandardowych atrybutów do zamówień</li>
                <li>Śledzenie statusu zamówień</li>
                <li>Filtrowanie i sortowanie zamówień w widoku podobnym do arkusza kalkulacyjnego</li>
                <li>Generowanie raportów zamówień</li>
              </ul>
              <p>Aby rozpocząć pracę, przejdź do sekcji <strong>Zamówienia</strong> w menu bocznym.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;