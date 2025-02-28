import React from 'react';
import OrdersGrid from '../components/orders/OrdersGrid';
import { Row, Col } from 'react-bootstrap';

const Orders = () => {
  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h1>Zarządzanie zamówieniami</h1>
          <p className="text-muted">Przeglądaj, dodawaj i zarządzaj zamówieniami produkcyjnymi</p>
        </Col>
      </Row>
      <OrdersGrid />
    </div>
  );
};

export default Orders;