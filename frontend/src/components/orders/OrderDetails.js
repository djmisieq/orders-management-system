import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import OrderComments from './OrderComments';
import OrderHistory from './OrderHistory';
import { ordersApi } from '../../services/api';

const OrderDetails = ({ orderId, onBack, onEdit }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.getOrderById(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Nie udało się pobrać szczegółów zamówienia.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    let variant = 'secondary';

    switch (status) {
      case 'New':
        variant = 'primary';
        break;
      case 'In Progress':
        variant = 'warning';
        break;
      case 'Completed':
        variant = 'success';
        break;
      case 'Cancelled':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }

    return <Badge bg={variant}>{status}</Badge>;
  };

  // Get localized status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'New':
        return 'Nowe';
      case 'In Progress':
        return 'W trakcie';
      case 'Completed':
        return 'Zakończone';
      case 'Cancelled':
        return 'Anulowane';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!order) {
    return <Alert variant="warning">Nie znaleziono zamówienia.</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={onBack}>
          <FaArrowLeft className="me-2" /> Powrót do listy
        </Button>
        <Button variant="primary" onClick={() => onEdit(order)}>
          <FaEdit className="me-2" /> Edytuj zamówienie
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Zamówienie #{order.id}</h4>
            <Badge bg="primary" className="fs-6">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Podstawowe informacje</h5>
              <Table striped bordered>
                <tbody>
                  <tr>
                    <th style={{ width: '40%' }}>Klient</th>
                    <td>{order.customerName}</td>
                  </tr>
                  <tr>
                    <th>Data zamówienia</th>
                    <td>{formatDate(order.orderDate)}</td>
                  </tr>
                  <tr>
                    <th>Ilość</th>
                    <td>{order.quantity}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{getStatusBadge(order.status)} {order.internalStatus && <small className="text-muted">({order.internalStatus})</small>}</td>
                  </tr>
                  <tr>
                    <th>Priorytet</th>
                    <td>
                      {order.priority === 5 && <Badge bg="danger">Wysoki</Badge>}
                      {order.priority === 4 && <Badge bg="warning">Podwyższony</Badge>}
                      {order.priority === 3 && <Badge bg="primary">Normalny</Badge>}
                      {order.priority === 2 && <Badge bg="info">Niski</Badge>}
                      {order.priority === 1 && <Badge bg="secondary">Bardzo niski</Badge>}
                    </td>
                  </tr>
                  <tr>
                    <th>Data utworzenia</th>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                  <tr>
                    <th>Ostatnia aktualizacja</th>
                    <td>{formatDate(order.updatedAt)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Terminarz i opis</h5>
              <Table striped bordered className="mb-3">
                <tbody>
                  <tr>
                    <th style={{ width: '40%' }}>Planowana data realizacji</th>
                    <td>{formatDate(order.targetCompletionDate)}</td>
                  </tr>
                  <tr>
                    <th>Rzeczywista data realizacji</th>
                    <td>{formatDate(order.actualCompletionDate)}</td>
                  </tr>
                </tbody>
              </Table>
              <Card>
                <Card.Header>Opis</Card.Header>
                <Card.Body>
                  {order.description || <span className="text-muted">Brak opisu</span>}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {order.attributes && order.attributes.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3">Atrybuty niestandardowe</h5>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Nazwa</th>
                    <th>Wartość</th>
                    <th>Typ</th>
                  </tr>
                </thead>
                <tbody>
                  {order.attributes.map((attr) => (
                    <tr key={attr.id}>
                      <td>{attr.attributeName}</td>
                      <td>{attr.attributeValue}</td>
                      <td>
                        <Badge bg="info">{attr.attributeType}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <OrderComments orderId={orderId} />
        </Col>
        <Col md={6}>
          <OrderHistory orderId={orderId} />
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetails;