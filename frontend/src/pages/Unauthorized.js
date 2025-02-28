import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLock, FaHome } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <div className="mb-4">
                <FaLock size={50} className="text-danger" />
              </div>
              <h2 className="mb-3">Brak dostępu</h2>
              <p className="text-muted mb-4">
                Nie masz uprawnień do wyświetlenia tej strony. 
                Prosimy o kontakt z administratorem, jeśli uważasz, 
                że powinien być przyznany dostęp.
              </p>
              <Link to="/" className="btn btn-primary">
                <FaHome className="me-2" /> Powrót do strony głównej
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Unauthorized;