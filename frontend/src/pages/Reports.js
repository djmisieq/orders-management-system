import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';

const Reports = () => {
  return (
    <div>
      <h1 className="mb-4">Raporty zamówień</h1>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Filtrowanie raportów</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Typ raportu</Form.Label>
                  <Form.Select>
                    <option>Wszystkie zamówienia</option>
                    <option>Zamówienia wg klienta</option>
                    <option>Zamówienia wg statusu</option>
                    <option>Statystyki dzienne</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Data od</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Data do</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Klient</Form.Label>
                  <Form.Select>
                    <option>Wszyscy klienci</option>
                    <option>ACME Corp</option>
                    <option>Tech Solutions</option>
                    <option>Global Industries</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select>
                    <option>Wszystkie statusy</option>
                    <option>Nowe</option>
                    <option>W trakcie</option>
                    <option>Zakończone</option>
                    <option>Anulowane</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary">
                    Generuj raport
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Podgląd raportu</h5>
              <div>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  Eksportuj PDF
                </Button>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  Eksportuj Excel
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Drukuj
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <p className="text-muted">Wybierz parametry i wygeneruj raport</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;