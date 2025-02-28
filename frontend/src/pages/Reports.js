import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Nav, Tab } from 'react-bootstrap';
import { FaSearch, FaFilePdf, FaFileExcel, FaPrint } from 'react-icons/fa';
import OrdersChart from '../components/reports/OrdersChart';

const Reports = () => {
  const [filterParams, setFilterParams] = useState({
    dateFrom: '',
    dateTo: '',
    customer: '',
    status: ''
  });
  
  const [activeTab, setActiveTab] = useState('statusDistribution');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams({
      ...filterParams,
      [name]: value
    });
  };

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
                  <Form.Select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                  >
                    <option value="statusDistribution">Rozkład statusów</option>
                    <option value="monthlyTrends">Trendy miesięczne</option>
                    <option value="customerDistribution">Rozkład klientów</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Data od</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="dateFrom"
                    value={filterParams.dateFrom}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Data do</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="dateTo"
                    value={filterParams.dateTo}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Klient</Form.Label>
                  <Form.Select 
                    name="customer"
                    value={filterParams.customer}
                    onChange={handleFilterChange}
                  >
                    <option value="">Wszyscy klienci</option>
                    <option value="ACME Corp">ACME Corp</option>
                    <option value="Tech Solutions">Tech Solutions</option>
                    <option value="Global Industries">Global Industries</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select 
                    name="status"
                    value={filterParams.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Wszystkie statusy</option>
                    <option value="New">Nowe</option>
                    <option value="In Progress">W trakcie</option>
                    <option value="Completed">Zakończone</option>
                    <option value="Cancelled">Anulowane</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary">
                    <FaSearch className="me-2" /> Generuj raport
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {activeTab === 'statusDistribution' && 'Rozkład zamówień wg statusu'}
                {activeTab === 'monthlyTrends' && 'Trendy miesięczne zamówień'}
                {activeTab === 'customerDistribution' && 'Rozkład zamówień wg klientów'}
              </h5>
              <div>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <FaFilePdf /> PDF
                </Button>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <FaFileExcel /> Excel
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <FaPrint /> Drukuj
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <OrdersChart chartType={activeTab} filterParams={filterParams} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Podsumowanie</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="mb-4">
                    <h6>Liczba zamówień</h6>
                    <h2 className="text-primary">120</h2>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-4">
                    <h6>Średnia ilość</h6>
                    <h2 className="text-success">15.4</h2>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-4">
                    <h6>Zamówienia zakończone</h6>
                    <h2 className="text-info">68%</h2>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <h6>Najczęstszy klient</h6>
                  <p className="text-muted">ACME Corp (45 zamówień)</p>
                  
                  <h6>Największy wzrost</h6>
                  <p className="text-muted">Luty 2023 (+24% m/m)</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;