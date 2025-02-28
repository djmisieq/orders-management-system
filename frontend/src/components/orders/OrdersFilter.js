import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFilter, FaUndo } from 'react-icons/fa';
import { format } from 'date-fns';

const OrdersFilter = ({ onFilterChange }) => {
  const initialFilterState = {
    customerName: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    minQuantity: '',
    maxQuantity: '',
  };

  const [filters, setFilters] = useState(initialFilterState);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare filter object for AG Grid filtering
    const filterModel = {};
    
    if (filters.customerName) {
      filterModel.customerName = {
        type: 'contains',
        filter: filters.customerName
      };
    }
    
    if (filters.status) {
      filterModel.status = {
        type: 'equals',
        filter: filters.status
      };
    }
    
    if (filters.minQuantity || filters.maxQuantity) {
      filterModel.quantity = {
        type: 'inRange',
        filter: filters.minQuantity || null,
        filterTo: filters.maxQuantity || null
      };
    }
    
    if (filters.dateFrom || filters.dateTo) {
      filterModel.orderDate = {
        type: 'inRange',
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : null,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : null
      };
    }
    
    // Pass the filter to parent component
    onFilterChange(filterModel);
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
    onFilterChange({});
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };
  
  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="mb-4">
      <Card.Header 
        className="d-flex justify-content-between align-items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <FaFilter className="me-2" />
          Filtrowanie zamówień
          {activeFilterCount > 0 && (
            <span className="badge bg-primary ms-2">{activeFilterCount}</span>
          )}
        </div>
        <div className="small text-muted">
          {expanded ? 'Kliknij aby zwinąć' : 'Kliknij aby rozwinąć'}
        </div>
      </Card.Header>
      
      {expanded && (
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Nazwa klienta</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={filters.customerName}
                    onChange={handleChange}
                    placeholder="Wprowadź nazwę klienta"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                  >
                    <option value="">Wszystkie statusy</option>
                    <option value="New">Nowe</option>
                    <option value="In Progress">W trakcie</option>
                    <option value="Completed">Zakończone</option>
                    <option value="Cancelled">Anulowane</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Ilość (od-do)</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        name="minQuantity"
                        value={filters.minQuantity}
                        onChange={handleChange}
                        placeholder="Od"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        name="maxQuantity"
                        value={filters.maxQuantity}
                        onChange={handleChange}
                        placeholder="Do"
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data zamówienia (od)</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data zamówienia (do)</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                onClick={resetFilters} 
                className="me-2"
                type="button"
              >
                <FaUndo className="me-1" /> Reset
              </Button>
              <Button variant="primary" type="submit">
                <FaFilter className="me-1" /> Filtruj
              </Button>
            </div>
          </Form>
        </Card.Body>
      )}
    </Card>
  );
};

export default OrdersFilter;